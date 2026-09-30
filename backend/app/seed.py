import json
import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.entities import (
    User, JobRole, Competency, RoleCompetency, TraineeProfile,
    TrainerProfile, UserCompetency, Course, CourseCompetency,
    CourseResource, Enrollment, Assessment, Question, AssessmentAttempt,
    Certificate, TrainingRequirement, TrainingRequirementCompetency,
    TrainerMatch, CourseFeedback, Notification, Announcement, AuditLog
)
from app.services.auth_service import get_password_hash
from app.services.trainer_matching_service import run_trainer_matching

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "admin@capacityconnect.demo").first():
        print("Database already contains seed data.")
        return

    print("Seeding database with realistic IMD & Ministry of Earth Sciences demo data...")

    # 1. Competencies
    competencies_data = [
        {"name": "Python", "code": "COMP-PY", "category": "Data & Computing", "description": "Programming with NumPy, xarray, cartopy, and NetCDF data manipulation."},
        {"name": "Data Analytics", "code": "COMP-DA", "category": "Data & Computing", "description": "Atmospheric statistical analysis, extreme event detection, and trend modeling."},
        {"name": "Numerical Weather Prediction", "code": "COMP-NWP", "category": "Core Meteorology", "description": "Primitive equations, data assimilation (3D/4D-Var), boundary layer physics, and WRF model execution."},
        {"name": "Remote Sensing", "code": "COMP-RS", "category": "Earth Observation", "description": "INSAT-3D/3DR optical/infrared channel analysis, sounder profiles, and cloud motion vectors."},
        {"name": "GIS", "code": "COMP-GIS", "category": "Earth Observation", "description": "Spatial coordinate systems, QGIS geospatial workflows, and hazard mapping."},
        {"name": "Meteorological Data Processing", "code": "COMP-MDP", "category": "Core Meteorology", "description": "Doppler Weather Radar (DWR) reflectivity/velocity processing and automated weather station telemetry."},
        {"name": "Data Visualization", "code": "COMP-DV", "category": "Data & Computing", "description": "Cartographic map rendering, meteograms, tephigrams, and interactive dashboard creation."},
        {"name": "Risk Communication", "code": "COMP-RC", "category": "Public & Institutional", "description": "Disaster early warning dissemination, color-coded weather bulletins, and multi-agency crisis coordination."}
    ]

    comp_map = {}
    for c_data in competencies_data:
        comp = Competency(
            name=c_data["name"],
            code=c_data["code"],
            category=c_data["category"],
            description=c_data["description"],
            max_level=5
        )
        db.add(comp)
        db.flush()
        comp_map[comp.name] = comp

    # 2. Job Roles
    job_roles_data = [
        {
            "title": "Meteorologist Grade-I",
            "code": "ROLE-MET-1",
            "description": "Operational weather forecaster responsible for synoptic chart analysis, NWP interpretation, and severe weather warnings.",
            "reqs": [
                ("Python", 4, "critical"),
                ("Data Analytics", 4, "critical"),
                ("Numerical Weather Prediction", 4, "critical"),
                ("Remote Sensing", 3, "recommended"),
                ("GIS", 3, "recommended"),
                ("Risk Communication", 3, "critical")
            ]
        },
        {
            "title": "Weather Radar Specialist",
            "code": "ROLE-RADAR-SPEC",
            "description": "Engineer/scientist operating Doppler Weather Radar networks and convective nowcasting pipelines.",
            "reqs": [
                ("Meteorological Data Processing", 5, "critical"),
                ("Python", 4, "recommended"),
                ("Numerical Weather Prediction", 3, "recommended"),
                ("Risk Communication", 4, "critical")
            ]
        },
        {
            "title": "Climate Risk Analyst",
            "code": "ROLE-CLIM-ANALYST",
            "description": "Specialist in decadal climate modeling, agro-meteorological advisories, and disaster mitigation.",
            "reqs": [
                ("Data Analytics", 5, "critical"),
                ("GIS", 4, "critical"),
                ("Python", 4, "recommended"),
                ("Risk Communication", 4, "critical")
            ]
        }
    ]

    job_role_map = {}
    for r_data in job_roles_data:
        jr = JobRole(
            title=r_data["title"],
            code=r_data["code"],
            description=r_data["description"],
            department="India Meteorological Department"
        )
        db.add(jr)
        db.flush()
        job_role_map[jr.title] = jr

        for comp_name, req_lvl, imp in r_data["reqs"]:
            if comp_name in comp_map:
                rc = RoleCompetency(
                    job_role_id=jr.id,
                    competency_id=comp_map[comp_name].id,
                    required_level=req_lvl,
                    importance=imp
                )
                db.add(rc)

    # 3. Demo Users
    hashed_default = get_password_hash("Demo@123")

    # Admin User
    admin = User(
        email="admin@capacityconnect.demo",
        hashed_password=hashed_default,
        full_name="Dr. K. V. Ramanathan",
        role="admin",
        designation="Director of Capacity Building & Training",
        department="Ministry of Earth Sciences / IMD Central HQ",
        is_approved=True,
        is_active=True
    )
    db.add(admin)

    # Lead Trainer 1 (Prof. Ananya Sen)
    trainer1 = User(
        email="trainer@capacityconnect.demo",
        hashed_password=hashed_default,
        full_name="Prof. Ananya Sen",
        role="trainer",
        designation="Senior Principal Scientist & Master Trainer",
        department="Numerical Weather Prediction Division, IMD",
        is_approved=True,
        is_active=True
    )
    db.add(trainer1)
    db.flush()

    trainer1_profile = TrainerProfile(
        user_id=trainer1.id,
        qualifications="Ph.D. Atmospheric & Space Sciences, IIT Delhi",
        experience_years=12,
        expertise_areas="Numerical Weather Prediction, Python for Meteorology, Data Assimilation, Atmospheric Physics",
        competencies_taught="Numerical Weather Prediction, Python, Data Analytics",
        certifications="WMO Class-I Certified Meteorologist, IMD Master Pedagogical Trainer",
        bio="12+ years of high-performance modeling experience at IMD and NCMRWF. Author of 24 international atmospheric modeling papers.",
        rating=4.9,
        total_trainings_delivered=28
    )
    db.add(trainer1_profile)

    # Trainer 2 (Dr. Vikramaditya Joshi)
    trainer2 = User(
        email="trainer2@capacityconnect.demo",
        hashed_password=hashed_default,
        full_name="Dr. Vikramaditya Joshi",
        role="trainer",
        designation="Scientist 'E' (Satellite & Radar Meteorology)",
        department="Satellite Meteorology Division, IMD",
        is_approved=True,
        is_active=True
    )
    db.add(trainer2)
    db.flush()

    trainer2_profile = TrainerProfile(
        user_id=trainer2.id,
        qualifications="Ph.D. Geospatial Hydrometeorology, Pune University",
        experience_years=9,
        expertise_areas="Satellite Meteorology, INSAT-3DR Image Processing, GIS, Radar Remote Sensing",
        competencies_taught="Remote Sensing, GIS, Meteorological Data Processing",
        certifications="ISRO Geomatics Professional, WMO Meteorological Satellite Trainer",
        bio="Lead scientist managing satellite ingest pipelines and radar calibration networks across western India.",
        rating=4.8,
        total_trainings_delivered=16
    )
    db.add(trainer2_profile)

    # Trainer 3 (Dr. Sunita Deshmukh)
    trainer3 = User(
        email="trainer3@capacityconnect.demo",
        hashed_password=hashed_default,
        full_name="Dr. Sunita Deshmukh",
        role="trainer",
        designation="Senior Consultant (Disaster Risk & Agro-Met)",
        department="Climate Risk Communication Group, MoES",
        is_approved=True,
        is_active=True
    )
    db.add(trainer3)
    db.flush()

    trainer3_profile = TrainerProfile(
        user_id=trainer3.id,
        qualifications="M.Tech Climate Science, Ph.D. Disaster Management",
        experience_years=14,
        expertise_areas="Risk Communication, Extreme Weather Early Warning, Climate Data Analytics",
        competencies_taught="Risk Communication, Data Analytics",
        certifications="UN-ISDR Certified Disaster Risk Practitioner, National Crisis Management Faculty",
        bio="14+ years developing national early warning dissemination frameworks for cyclone and heatwave hazards.",
        rating=4.95,
        total_trainings_delivered=34
    )
    db.add(trainer3_profile)

    # Trainee User (Dr. Rajesh Sharma)
    trainee = User(
        email="trainee@capacityconnect.demo",
        hashed_password=hashed_default,
        full_name="Dr. Rajesh Sharma",
        role="trainee",
        designation="Meteorologist Grade-I",
        department="National Weather Forecasting Centre, IMD",
        is_approved=True,
        is_active=True
    )
    db.add(trainee)
    db.flush()

    trainee_profile = TraineeProfile(
        user_id=trainee.id,
        job_role_id=job_role_map["Meteorologist Grade-I"].id,
        qualifications="M.Sc. Atmospheric Sciences, Pune University",
        experience_years=3,
        bio="Operational meteorologist actively preparing daily national weather bulletins and cyclone tracking forecasts.",
        skills="Synoptic Chart Analysis, Basic Python, QGIS, Tephigram Interpretation",
        interests="NWP Assimilation, Deep Learning for Nowcasting, Weather Data Visualization",
        certifications="IMD Operational Forecaster Foundation Certificate"
    )
    db.add(trainee_profile)

    # User Competencies for Trainee:
    # Deliberate realistic skill gaps:
    # Python: Current 2, Required 4 (GAP = 2)
    # Data Analytics: Current 2, Required 4 (GAP = 2)
    # NWP: Current 3, Required 4 (GAP = 1)
    # Remote Sensing: Current 2, Required 3 (GAP = 1)
    # GIS: Current 3, Required 3 (GAP = 0, ON TRACK)
    # Risk Communication: Current 3, Required 3 (GAP = 0, ON TRACK)
    trainee_comps = [
        ("Python", 2, "Foundation Python Course (Internal)", "Self-declared code samples"),
        ("Data Analytics", 2, "University Statistics Course", "Academic transcript"),
        ("Numerical Weather Prediction", 3, "NWP Orientation Workshop", "Operational forecast logs"),
        ("Remote Sensing", 2, "INSAT Imagery Primer", "Basic satellite image reading"),
        ("GIS", 3, "QGIS Basic Mapping Workshop", "Shapefile generation test"),
        ("Risk Communication", 3, "Media Briefing Protocols", "Public weather bulletin writing")
    ]
    for comp_name, curr_lvl, src, evi in trainee_comps:
        if comp_name in comp_map:
            uc = UserCompetency(
                user_id=trainee.id,
                competency_id=comp_map[comp_name].id,
                current_level=curr_lvl,
                assessment_source=src,
                evidence=evi,
                last_updated=datetime.datetime.utcnow() - datetime.timedelta(days=10)
            )
            db.add(uc)

    # 4. Courses
    courses_data = [
        {
            "title": "Python for Meteorological Data Analysis",
            "slug": "python-for-meteorological-data-analysis",
            "trainer": trainer1,
            "subject": "Atmospheric Computing",
            "category": "Data & Computing",
            "difficulty": "intermediate",
            "duration_hours": 14.0,
            "objectives": "Master multi-dimensional NetCDF/GRIB manipulation with xarray, cartographic projections via Cartopy, and automated weather anomaly detection.",
            "prerequisites": "Basic Python syntax and familiarity with weather parameters.",
            "comps": [("Python", 4, 1), ("Data Analytics", 4, 1)],
            "resources": [
                ("Operational NetCDF Manipulation Handbook.pdf", "pdf", "/uploads/demo_netcdf_guide.pdf", "Comprehensive guide to xarray and Cartopy cartographic projections."),
                ("Advanced Meteorological Data Scripting.pptx", "pptx", "/uploads/demo_python_met.pptx", "Slide presentation covering satellite grid masking and anomaly plots."),
                ("Cyclone Track Visualization in Python", "video", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "Video demonstration of plotting historical cyclone trajectories using Matplotlib and Cartopy.")
            ],
            "assessment": {
                "title": "Python for Meteorological Analysis Assessment",
                "desc": "Official competency assessment covering xarray array operations, EPSG spatial transformations, and gridded atmospheric calculations.",
                "passing": 70.0,
                "target_lvl": 4,
                "questions": [
                    {
                        "q": "Which Python library provides labeled N-dimensional dataset structures purpose-built for NetCDF and GRIB meteorological model data?",
                        "a": "Flask", "b": "xarray", "c": "BeautifulSoup", "d": "SQLAlchemy",
                        "ans": "B",
                        "exp": "xarray provides N-dimensional labeled array structures specifically tailored for NetCDF and GRIB climate datasets.",
                        "topic": "NetCDF Processing", "diff": "intermediate", "pts": 20
                    },
                    {
                        "q": "In Cartopy, which class specifies the standard unprojected World Geodetic System (WGS 84) coordinate system?",
                        "a": "ccrs.PlateCarree()", "b": "ccrs.Robinson()", "c": "ccrs.Orthographic()", "d": "ccrs.LambertConformal()",
                        "ans": "A",
                        "exp": "PlateCarree() represents the unprojected equi-rectangular (lon/lat) projection on WGS 84 ellipsoid.",
                        "topic": "Cartographic Projection", "diff": "intermediate", "pts": 20
                    },
                    {
                        "q": "What is the principal benefit of Dask integration within xarray when analyzing terabyte-scale ERA5 climate reanalysis grids?",
                        "a": "Automatic translation of code into Fortran 90",
                        "b": "Lazy evaluation and chunked parallel computing out-of-core",
                        "c": "Conversion of multidimensional tensors to plain text CSV files",
                        "d": "Direct hardware control of satellite dish rotators",
                        "ans": "B",
                        "exp": "Dask enables lazy evaluation and distributed chunk-based processing of datasets that exceed system RAM.",
                        "topic": "High Performance Computing", "diff": "advanced", "pts": 20
                    },
                    {
                        "q": "Which mathematical operator in NumPy/xarray performs efficient element-wise broadcasting across mismatched spatial dimensions?",
                        "a": "Automatic dimension alignment and broadcasting",
                        "b": "Manual nested for-loops across latitude and longitude",
                        "c": "Serialization to JSON strings",
                        "d": "Bitwise XOR masking",
                        "ans": "A",
                        "exp": "xarray automatically aligns dimensions and broadcasts arrays based on coordinate dimension labels.",
                        "topic": "Array Operations", "diff": "beginner", "pts": 20
                    },
                    {
                        "q": "When calculating Potential Temperature (theta) from temperature and pressure arrays, which physical constant is primarily required?",
                        "a": "Poisson constant (kappa = R_d / c_p ≈ 0.286)",
                        "b": "Stefan-Boltzmann constant (sigma)",
                        "c": "Avogadro's number",
                        "d": "Planck's constant",
                        "ans": "A",
                        "exp": "Potential temperature is computed as theta = T * (P0 / P)^kappa, where kappa is approximately 0.286 for dry air.",
                        "topic": "Atmospheric Thermodynamics", "diff": "intermediate", "pts": 20
                    }
                ]
            }
        },
        {
            "title": "Numerical Weather Prediction Fundamentals",
            "slug": "numerical-weather-prediction-fundamentals",
            "trainer": trainer1,
            "subject": "Atmospheric Modeling",
            "category": "Core Meteorology",
            "difficulty": "advanced",
            "duration_hours": 18.0,
            "objectives": "Understand primitive equations, grid-point vs spectral schemes, ensemble prediction systems (EPS), and 3D/4D-Var data assimilation.",
            "prerequisites": "Atmospheric dynamic meteorology and vector calculus.",
            "comps": [("Numerical Weather Prediction", 4, 1)],
            "resources": [
                ("Operational NWP Primitive Equations Manual.pdf", "pdf", "/uploads/demo_nwp_manual.pdf", "Mathematical derivation of hydrostatic and non-hydrostatic atmospheric governing equations."),
                ("Ensemble Prediction Systems (EPS) Lecture.pptx", "pptx", "/uploads/demo_eps_slides.pptx", "Probabilistic forecasting and spread-skill relationship.")
            ],
            "assessment": {
                "title": "NWP Operational Principles Assessment",
                "desc": "Rigorous evaluation of numerical model physics, parameterization schemes, and data assimilation dynamics.",
                "passing": 70.0,
                "target_lvl": 4,
                "questions": [
                    {
                        "q": "In atmospheric models, what does the Courant-Friedrichs-Lewy (CFL) condition govern?",
                        "a": "The maximum permissible time-step for numerical stability given spatial grid spacing and wave speed",
                        "b": "The total amount of radiative flux absorbed by ozone",
                        "c": "The rate of cloud droplet coalescing into raindrops",
                        "d": "The height of the planetary boundary layer at solar noon",
                        "ans": "A",
                        "exp": "The CFL criterion ensures that computational propagation speed exceeds physical wave speed, preventing numerical instabilities.",
                        "topic": "Numerical Stability", "diff": "advanced", "pts": 25
                    },
                    {
                        "q": "Which data assimilation methodology incorporates time-distributed observations across an assimilation window using adjoint equations?",
                        "a": "3D-Var", "b": "4D-Var", "c": "Optimal Interpolation", "d": "Successive Corrections",
                        "ans": "B",
                        "exp": "4D-Var assimilates observations across a temporal window by integrating the forward and adjoint model equations.",
                        "topic": "Data Assimilation", "diff": "advanced", "pts": 25
                    },
                    {
                        "q": "Why are sub-grid scale processes such as cumulus convection parameterized rather than resolved explicitly in global NWP models?",
                        "a": "They occur at scales smaller than the model horizontal grid resolution",
                        "b": "They have no effect on large-scale atmospheric circulation",
                        "c": "They only occur over oceanic bodies",
                        "d": "They violate the second law of thermodynamics",
                        "ans": "A",
                        "exp": "Processes occurring below horizontal grid spacing (e.g. convective plumes, microphysics) must be statistically parameterized.",
                        "topic": "Physical Parameterization", "diff": "intermediate", "pts": 25
                    },
                    {
                        "q": "In Ensemble Prediction Systems (EPS), what does a large ensemble spread typically signify?",
                        "a": "High forecast certainty and strong predictability",
                        "b": "Higher atmospheric uncertainty and lower deterministic predictability",
                        "c": "Sensor hardware malfunction in the radar network",
                        "d": "Imminent satellite telemetry outage",
                        "ans": "B",
                        "exp": "Ensemble spread reflects divergence among perturbed forecast members, indicating elevated atmospheric uncertainty.",
                        "topic": "Ensemble Forecasting", "diff": "intermediate", "pts": 25
                    }
                ]
            }
        },
        {
            "title": "GIS for Weather and Climate Applications",
            "slug": "gis-for-weather-and-climate-applications",
            "trainer": trainer2,
            "subject": "Geospatial Analysis",
            "category": "Earth Observation",
            "difficulty": "intermediate",
            "duration_hours": 10.0,
            "objectives": "Learn spatial joins, catchment delineation, flood risk zonation, and raster overlay modeling in QGIS.",
            "prerequisites": "Basic understanding of geographic coordinates.",
            "comps": [("GIS", 4, 1)],
            "resources": [
                ("QGIS Hydro-meteorological Workflows.pdf", "pdf", "/uploads/demo_gis_guide.pdf", "Tutorial on watershed basin overlay and meteorological raster interpolation.")
            ],
            "assessment": None
        },
        {
            "title": "Satellite Meteorology & INSAT-3DR Processing",
            "slug": "satellite-meteorology-insat-3dr-processing",
            "trainer": trainer2,
            "subject": "Earth Observation",
            "category": "Earth Observation",
            "difficulty": "intermediate",
            "duration_hours": 12.0,
            "objectives": "Interpret INSAT-3D/3DR multispectral imagery, derive cloud top temperatures, and track convective initiation.",
            "prerequisites": "Electromagnetic radiation basics.",
            "comps": [("Remote Sensing", 4, 1)],
            "resources": [
                ("INSAT-3DR Imager and Sounder Technical Reference.pdf", "pdf", "/uploads/demo_insat_ref.pdf", "Spectral channel specifications and atmospheric profile retrieval procedures.")
            ],
            "assessment": None
        },
        {
            "title": "Disaster and Weather Risk Communication",
            "slug": "disaster-and-weather-risk-communication",
            "trainer": trainer3,
            "subject": "Public & Institutional",
            "category": "Public & Institutional",
            "difficulty": "intermediate",
            "duration_hours": 8.0,
            "objectives": "Impact-based forecasting, color-coded weather bulletins (Red, Orange, Yellow), and stakeholder coordination with NDMA/SDMAs.",
            "prerequisites": "None.",
            "comps": [("Risk Communication", 4, 1)],
            "resources": [
                ("Standard Operating Procedure for Severe Weather Alerts.pdf", "pdf", "/uploads/demo_alert_sop.pdf", "Protocol for issuing impact-based warnings to disaster management authorities.")
            ],
            "assessment": None
        }
    ]

    for c_info in courses_data:
        course = Course(
            title=c_info["title"],
            slug=c_info["slug"],
            description=c_info["objectives"],
            trainer_id=c_info["trainer"].id,
            subject=c_info["subject"],
            category=c_info["category"],
            difficulty=c_info["difficulty"],
            duration_hours=c_info["duration_hours"],
            objectives=c_info["objectives"],
            prerequisites=c_info["prerequisites"],
            status="published"
        )
        db.add(course)
        db.flush()

        # Add course competencies
        for comp_name, target_lvl, exp_imp in c_info["comps"]:
            if comp_name in comp_map:
                cc = CourseCompetency(
                    course_id=course.id,
                    competency_id=comp_map[comp_name].id,
                    target_level=target_lvl,
                    expected_improvement=exp_imp
                )
                db.add(cc)

        # Add resources
        for res_title, r_type, url, desc in c_info["resources"]:
            res = CourseResource(
                course_id=course.id,
                trainer_id=c_info["trainer"].id,
                title=res_title,
                resource_type=r_type,
                file_url=url,
                file_size_kb=1540,
                description=desc
            )
            db.add(res)

        # Add assessment if specified
        if c_info["assessment"]:
            a_data = c_info["assessment"]
            primary_comp = comp_map.get(c_info["comps"][0][0]) if c_info["comps"] else None
            assessment = Assessment(
                course_id=course.id,
                competency_id=primary_comp.id if primary_comp else None,
                created_by=c_info["trainer"].id,
                title=a_data["title"],
                description=a_data["desc"],
                time_limit_minutes=20,
                passing_score=a_data["passing"],
                target_competency_level=a_data["target_lvl"],
                is_published=True,
                deadline=datetime.datetime.utcnow() + datetime.timedelta(days=30)
            )
            db.add(assessment)
            db.flush()

            for q_data in a_data["questions"]:
                question = Question(
                    assessment_id=assessment.id,
                    question_text=q_data["q"],
                    option_a=q_data["a"],
                    option_b=q_data["b"],
                    option_c=q_data["c"],
                    option_d=q_data["d"],
                    correct_option=q_data["ans"],
                    explanation=q_data["exp"],
                    topic=q_data["topic"],
                    difficulty=q_data["diff"],
                    points=q_data["pts"]
                )
                db.add(question)

    # 5. Training Requirements (for Admin & Trainer Matching Golden Demo Flow)
    req1 = TrainingRequirement(
        title="Advanced Weather Data Analytics & Python Automation",
        subject="Python and Meteorological Data Processing",
        description="Comprehensive 5-day operational workshop for zonal forecasters on automated GRIB2 decoding, radar assimilation, and cloud anomaly alerts.",
        department="National Weather Forecasting Centre, New Delhi",
        required_experience_years=8,
        duration_days=5,
        deadline=datetime.datetime.utcnow() + datetime.timedelta(days=21),
        status="open",
        created_by=admin.id
    )
    db.add(req1)
    db.flush()

    for comp_name, req_lvl in [("Python", 4), ("Data Analytics", 4), ("Meteorological Data Processing", 3)]:
        if comp_name in comp_map:
            trc = TrainingRequirementCompetency(
                requirement_id=req1.id,
                competency_id=comp_map[comp_name].id,
                required_level=req_lvl
            )
            db.add(trc)

    req2 = TrainingRequirement(
        title="Radar Nowcasting and Convective Storm Tracking",
        subject="Doppler Weather Radar Interpretation",
        description="Operational training for regional radar meteorologists in detecting mesocyclones, microbursts, and flash flood precipitation cores.",
        department="Radar Meteorology Division, Chennai",
        required_experience_years=6,
        duration_days=4,
        deadline=datetime.datetime.utcnow() + datetime.timedelta(days=14),
        status="open",
        created_by=admin.id
    )
    db.add(req2)
    db.flush()

    for comp_name, req_lvl in [("Meteorological Data Processing", 4), ("Remote Sensing", 4), ("Risk Communication", 3)]:
        if comp_name in comp_map:
            trc = TrainingRequirementCompetency(
                requirement_id=req2.id,
                competency_id=comp_map[comp_name].id,
                required_level=req_lvl
            )
            db.add(trc)

    # 6. Public Announcements
    announcements = [
        Announcement(
            title="National Monsoon Preparedness Capacity Building Initiative",
            content="Ministry of Earth Sciences announces centralized training modules on Numerical Weather Prediction and Severe Weather Warning dissemination ahead of the upcoming southwest monsoon.",
            target_role="all",
            priority="high",
            created_by=admin.id
        ),
        Announcement(
            title="New AI-Assisted Assessment Generation Tool Live for Faculty",
            content="Trainers can now generate accredited meteorological assessment questions automatically from uploaded study notes with human-in-the-loop review.",
            target_role="trainer",
            priority="normal",
            created_by=admin.id
        )
    ]
    for ann in announcements:
        db.add(ann)

    # 7. Notifications for Trainee
    notifications = [
        Notification(
            user_id=trainee.id,
            title="Competency Gap Identified: Python (Level 2 vs Required Level 4)",
            message="Your competency profile indicates an active skill gap. We recommend enrolling in 'Python for Meteorological Data Analysis'.",
            link="/trainee/recommendations",
            type="assessment",
            is_read=False
        ),
        Notification(
            user_id=trainee.id,
            title="Institutional Training Cycle 2026 Announced",
            message="Check the updated course catalog for accredited Earth Sciences competency modules.",
            link="/trainee/courses",
            type="course",
            is_read=True
        )
    ]
    for notif in notifications:
        db.add(notif)

    # Pre-enroll trainee into course 1 with 30% progress so they can immediately test
    py_course = db.query(Course).filter(Course.slug == "python-for-meteorological-data-analysis").first()
    if py_course:
        enr = Enrollment(
            user_id=trainee.id,
            course_id=py_course.id,
            progress_percent=30.0,
            status="in_progress"
        )
        db.add(enr)

    db.commit()

    # Pre-run matching for requirements
    run_trainer_matching(db, req1.id)
    run_trainer_matching(db, req2.id)

    print("Demo data successfully seeded!")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
