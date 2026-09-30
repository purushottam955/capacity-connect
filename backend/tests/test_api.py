import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["platform"] == "CAPACITY CONNECT"

def test_trainee_login_and_dashboard():
    # 1. Login
    login_res = client.post("/api/auth/login", json={
        "email": "trainee@capacityconnect.demo",
        "password": "Demo@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Trainee Dashboard
    dash_res = client.get("/api/trainee/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["user"]["full_name"] == "Dr. Rajesh Sharma"
    assert dash_data["metrics"]["competencies_gapped"] > 0
    assert len(dash_data["recommendations"]) > 0

    # 3. Check Explainable Recommendations
    rec = dash_data["recommendations"][0]
    assert "recommendation_reason" in rec
    assert "gap" in rec

def test_trainer_matching_algorithm():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@capacityconnect.demo",
        "password": "Demo@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Run matching on requirement 1
    match_res = client.get("/api/training-requirements/1/match-trainers", headers=headers)
    assert match_res.status_code == 200
    data = match_res.json()
    assert len(data["matches"]) > 0
    
    # Check top match
    top_match = data["matches"][0]
    assert "overall_match_score" in top_match
    assert "competency_score" in top_match
    assert "subject_score" in top_match
    assert "experience_score" in top_match
    assert "certification_score" in top_match
    assert len(top_match["match_reasons"]) > 0

def test_ai_mcq_generation():
    # Login as trainer
    login_res = client.post("/api/auth/login", json={
        "email": "trainer@capacityconnect.demo",
        "password": "Demo@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Generate MCQs
    res = client.post("/api/ai/generate-mcqs", json={
        "topic": "Numerical Weather Prediction",
        "num_questions": 3,
        "difficulty": "advanced"
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["questions"]) >= 3
    q = data["questions"][0]
    assert "question_text" in q
    assert "correct_option" in q
    assert "explanation" in q

def test_closed_loop_competency_update():
    # Login as trainee
    login_res = client.post("/api/auth/login", json={
        "email": "trainee@capacityconnect.demo",
        "password": "Demo@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check competencies before
    comp_res = client.get("/api/trainee/competencies", headers=headers)
    assert comp_res.status_code == 200
    comps_before = {c["name"]: c["current_level"] for c in comp_res.json()["competencies"]}
    py_before = comps_before.get("Python", 2)

    # Get assessment 1 (Python for Meteorological Analysis Assessment)
    assess_res = client.get("/api/assessments/1", headers=headers)
    assert assess_res.status_code == 200
    questions = assess_res.json()["questions"]

    # Submit correct answers for questions (correct options from seed: B, A, B, A, A)
    answers = {}
    correct_key = ["B", "A", "B", "A", "A"]
    for idx, q in enumerate(questions):
        answers[str(q["id"])] = correct_key[idx % len(correct_key)]

    submit_res = client.post("/api/assessments/1/submit", json={"answers": answers}, headers=headers)
    assert submit_res.status_code == 200
    result_data = submit_res.json()
    assert result_data["passed"] is True
    assert result_data["percentage"] >= 70.0
    assert result_data["competency_updated"] is True
    assert result_data["new_level"] > py_before

    # Verify competency actually changed in database
    comp_res_after = client.get("/api/trainee/competencies", headers=headers)
    comps_after = {c["name"]: c["current_level"] for c in comp_res_after.json()["competencies"]}
    assert comps_after.get("Python") > py_before

    # Verify certificate was issued
    cert_res = client.get("/api/trainee/certificates", headers=headers)
    assert cert_res.status_code == 200
    certs = cert_res.json()
    assert len(certs) > 0
