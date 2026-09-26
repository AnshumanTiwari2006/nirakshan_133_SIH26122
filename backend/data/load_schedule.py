import csv
from sqlalchemy.orm import Session
from backend.database.database import engine, SessionLocal
from backend.database.models import WBSActivity, Base

def load_master_schedule(csv_path: str = None):
    db = SessionLocal()
    try:
        if csv_path and csv_path.endswith('.csv'):
            rows = read_csv_rows(csv_path)
        else:
            rows = create_sample_schedule()
        
        for row in rows:
            wbs = WBSActivity(
                wbs_code=row['wbs_code'],
                level=int(row['level']),
                discipline=row['discipline'],
                activity_name=row['activity_name'],
                spec_ref=row.get('spec_ref') or None,
                planned_start=row.get('planned_start') or None,
                planned_finish=row.get('planned_finish') or None,
                duration_days=int(row['duration_days']) if row.get('duration_days') else None,
                parent_wbs=row.get('parent_wbs') or None
            )
            db.merge(wbs)
        
        db.commit()
        print(f"Loaded {len(rows)} WBS activities")
    except Exception as e:
        db.rollback()
        print(f"Error loading schedule: {e}")
    finally:
        db.close()

def read_csv_rows(csv_path: str):
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def create_sample_schedule():
    data = [
        {'wbs_code': 'EL-PMP-0045', 'level': 6, 'discipline': 'Electrical', 'activity_name': 'Main Pump Wiring and Hook-up', 'spec_ref': 'SPEC-EL-EQU-01', 'planned_start': '2026-08-10', 'planned_finish': '2026-08-15', 'duration_days': 5, 'parent_wbs': 'EL-PMP-0040'},
        {'wbs_code': 'EL-MTR-0019', 'level': 6, 'discipline': 'Electrical', 'activity_name': 'Motor Termination', 'spec_ref': 'SPEC-EL-EQU-02', 'planned_start': '2026-08-12', 'planned_finish': '2026-08-14', 'duration_days': 2, 'parent_wbs': 'EL-MTR-0010'},
        {'wbs_code': 'EL-CBL-0021', 'level': 6, 'discipline': 'Electrical', 'activity_name': 'Power Cable Pulling', 'spec_ref': 'SPEC-EL-CBL-01', 'planned_start': '2026-08-08', 'planned_finish': '2026-08-12', 'duration_days': 4, 'parent_wbs': 'EL-CBL-0020'},
        {'wbs_code': 'EL-INS-0033', 'level': 6, 'discipline': 'Electrical', 'activity_name': 'Instrumentation Cable Termination', 'spec_ref': 'SPEC-EL-INS-01', 'planned_start': '2026-08-15', 'planned_finish': '2026-08-18', 'duration_days': 3, 'parent_wbs': 'EL-INS-0030'},
        {'wbs_code': 'EL-GRD-0041', 'level': 6, 'discipline': 'Electrical', 'activity_name': 'Grounding and Bonding', 'spec_ref': 'SPEC-EL-GRD-01', 'planned_start': '2026-08-10', 'planned_finish': '2026-08-12', 'duration_days': 2, 'parent_wbs': 'EL-GRD-0040'},
        {'wbs_code': 'ME-PMP-0012', 'level': 6, 'discipline': 'Mechanical', 'activity_name': 'Main Pump Installation', 'spec_ref': 'SPEC-ME-PMP-01', 'planned_start': '2026-08-01', 'planned_finish': '2026-08-10', 'duration_days': 8, 'parent_wbs': 'ME-PMP-0010'},
        {'wbs_code': 'ME-PIP-0025', 'level': 6, 'discipline': 'Mechanical', 'activity_name': 'Process Piping Installation', 'spec_ref': 'SPEC-ME-PIP-01', 'planned_start': '2026-08-05', 'planned_finish': '2026-08-20', 'duration_days': 12, 'parent_wbs': 'ME-PIP-0020'},
        {'wbs_code': 'ME-VLV-0038', 'level': 6, 'discipline': 'Mechanical', 'activity_name': 'Control Valve Installation', 'spec_ref': 'SPEC-ME-VLV-01', 'planned_start': '2026-08-15', 'planned_finish': '2026-08-18', 'duration_days': 3, 'parent_wbs': 'ME-VLV-0030'},
        {'wbs_code': 'CV-STR-0007', 'level': 6, 'discipline': 'Civil', 'activity_name': 'Pump Foundation Construction', 'spec_ref': 'SPEC-CV-STR-01', 'planned_start': '2026-07-15', 'planned_finish': '2026-07-30', 'duration_days': 12, 'parent_wbs': 'CV-STR-0005'},
        {'wbs_code': 'CV-ACC-0014', 'level': 6, 'discipline': 'Civil', 'activity_name': 'Access Road Construction', 'spec_ref': 'SPEC-CV-ACC-01', 'planned_start': '2026-07-01', 'planned_finish': '2026-07-20', 'duration_days': 15, 'parent_wbs': 'CV-ACC-0010'},
    ]
    
    for i in range(10, 150):
        disciplines = ['Electrical', 'Mechanical', 'Civil', 'Instrumentation', 'Piping']
        disc = disciplines[i % len(disciplines)]
        prefixes = {'Electrical': 'EL', 'Mechanical': 'ME', 'Civil': 'CV', 'Instrumentation': 'IN', 'Piping': 'PI'}
        prefix = prefixes[disc]
        data.append({
            'wbs_code': f'{prefix}-{disc[:3].upper()}-{i:04d}',
            'level': 6,
            'discipline': disc,
            'activity_name': f'{disc} Activity {i}',
            'spec_ref': f'SPEC-{prefix}-{disc[:3].upper()}-{i:02d}',
            'planned_start': f'2026-08-{(i % 28) + 1:02d}',
            'planned_finish': f'2026-08-{(i % 28) + 3:02d}',
            'duration_days': (i % 10) + 1,
            'parent_wbs': f'{prefix}-{disc[:3].upper()}-{i-10:04d}' if i > 10 else None
        })
    
    return data

if __name__ == '__main__':
    Base.metadata.create_all(bind=engine)
    load_master_schedule()