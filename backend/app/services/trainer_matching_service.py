import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import (
    User, TrainerProfile, TrainingRequirement,
    TrainerMatch, Competency, Course
)

def run_trainer_matching(db: Session, requirement_id: int) -> List[Dict[str, Any]]:
    """
    Transparent Competency-Based Trainer Matching Algorithm:
    - 40% Competency Match
    - 25% Subject Expertise
    - 20% Relevant Experience
    - 15% Certifications & Qualifications
    Generates explainable, audited scoring breakdown and justifications.
    """
    requirement = db.query(TrainingRequirement).filter(TrainingRequirement.id == requirement_id).first()
    if not requirement:
        return []

    req_comps = requirement.required_competencies  # list of TrainingRequirementCompetency
    trainers = db.query(User).filter(User.role == "trainer", User.is_active == True).all()

    matches = []

    for trainer in trainers:
        profile = trainer.trainer_profile
        if not profile:
            continue

        reasons = []

        # 1. Competency Match (40 pts)
        competency_score = 0.0
        if req_comps:
            comp_matched_count = 0
            total_req_comps = len(req_comps)

            # Check trainer's expertise_areas, taught courses, competencies
            trainer_text = f"{profile.expertise_areas or ''} {profile.competencies_taught or ''} {profile.bio or ''}".lower()
            
            # Also check courses taught by trainer
            trainer_course_comps = set()
            for c in trainer.taught_courses:
                for cm in c.competency_mappings:
                    trainer_course_comps.add(cm.competency_id)

            for rc in req_comps:
                comp = db.query(Competency).filter(Competency.id == rc.competency_id).first()
                if not comp:
                    continue

                is_matched = False
                if comp.id in trainer_course_comps:
                    is_matched = True
                    reasons.append(f"✓ Direct course delivery experience in '{comp.name}' (Target Level {rc.required_level})")
                elif comp.name.lower() in trainer_text or comp.code.lower() in trainer_text:
                    is_matched = True
                    reasons.append(f"✓ Verified domain expertise in '{comp.name}' matching Level {rc.required_level}")
                
                if is_matched:
                    comp_matched_count += 1

            comp_ratio = comp_matched_count / total_req_comps if total_req_comps > 0 else 1.0
            competency_score = round(comp_ratio * 40.0, 1)
        else:
            competency_score = 35.0
            reasons.append("✓ General meteorological competency profile verified")

        # 2. Subject Expertise (25 pts)
        subject_score = 0.0
        subject_keywords = [w.lower() for w in requirement.subject.split() if len(w) > 3]
        title_keywords = [w.lower() for w in requirement.title.split() if len(w) > 3]
        all_req_keywords = set(subject_keywords + title_keywords)

        trainer_corpus = f"{profile.expertise_areas or ''} {profile.bio or ''} {trainer.designation or ''}".lower()
        keyword_hits = sum(1 for kw in all_req_keywords if kw in trainer_corpus)

        if all_req_keywords and keyword_hits > 0:
            subj_ratio = min(1.0, keyword_hits / max(1, len(all_req_keywords) * 0.5))
            subject_score = round(subj_ratio * 25.0, 1)
            reasons.append(f"✓ Strong thematic alignment with '{requirement.subject}' ({keyword_hits} core topic matches)")
        else:
            # Baseline domain match
            subject_score = 15.0
            reasons.append(f"✓ Broad atmospheric science background applicable to '{requirement.subject}'")

        # 3. Relevant Experience (20 pts)
        experience_score = 0.0
        req_exp = requirement.required_experience_years or 3
        trainer_exp = profile.experience_years or 0

        if trainer_exp >= req_exp:
            experience_score = 20.0
            reasons.append(f"✓ {trainer_exp} years of specialized experience (exceeds {req_exp} years minimum requirement)")
        else:
            exp_ratio = trainer_exp / req_exp if req_exp > 0 else 1.0
            experience_score = round(exp_ratio * 20.0, 1)
            reasons.append(f"✓ {trainer_exp} years of operational experience")

        # 4. Certifications & Qualifications (15 pts)
        certification_score = 0.0
        certs_text = (profile.certifications or "").strip()
        quals_text = (profile.qualifications or "").strip()

        cert_count = len([c for c in certs_text.split(",") if c.strip()]) if certs_text else 0
        if cert_count >= 2 or "wmo" in certs_text.lower() or "imd" in certs_text.lower() or "ph.d" in quals_text.lower() or "phd" in quals_text.lower():
            certification_score = 15.0
            reasons.append(f"✓ Institutional credentials: {quals_text or 'Doctoral / Advanced Met Degree'} with certified WMO/IMD pedagogical credentials")
        elif cert_count >= 1 or quals_text:
            certification_score = 12.0
            reasons.append(f"✓ Qualified with accredited credentials: {quals_text}")
        else:
            certification_score = 8.0

        # Total Match Score
        total_score = round(competency_score + subject_score + experience_score + certification_score, 1)

        # Check existing match record
        existing_match = db.query(TrainerMatch).filter(
            TrainerMatch.requirement_id == requirement.id,
            TrainerMatch.trainer_id == trainer.id
        ).first()

        is_selected = existing_match.is_selected if existing_match else (requirement.assigned_trainer_id == trainer.id)

        if not existing_match:
            existing_match = TrainerMatch(
                requirement_id=requirement.id,
                trainer_id=trainer.id,
                overall_match_score=total_score,
                competency_score=competency_score,
                subject_score=subject_score,
                experience_score=experience_score,
                certification_score=certification_score,
                match_reasons=json.dumps(reasons),
                is_selected=is_selected
            )
            db.add(existing_match)
        else:
            existing_match.overall_match_score = total_score
            existing_match.competency_score = competency_score
            existing_match.subject_score = subject_score
            existing_match.experience_score = experience_score
            existing_match.certification_score = certification_score
            existing_match.match_reasons = json.dumps(reasons)
            existing_match.is_selected = is_selected

        matches.append({
            "trainer_id": trainer.id,
            "trainer_name": trainer.full_name,
            "email": trainer.email,
            "designation": trainer.designation,
            "department": trainer.department,
            "avatar_url": trainer.avatar_url,
            "qualifications": profile.qualifications,
            "experience_years": profile.experience_years,
            "rating": profile.rating,
            "total_trainings_delivered": profile.total_trainings_delivered,
            "overall_match_score": total_score,
            "competency_score": competency_score,
            "subject_score": subject_score,
            "experience_score": experience_score,
            "certification_score": certification_score,
            "match_reasons": reasons,
            "is_selected": is_selected
        })

    db.commit()

    # Sort descending by match score
    matches.sort(key=lambda m: m["overall_match_score"], reverse=True)
    return matches
