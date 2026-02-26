-- Remove avalanche risk fields from trip_reports
alter table trip_reports drop column if exists avalanche_risk_level;
drop type if exists avalanche_risk_level;
