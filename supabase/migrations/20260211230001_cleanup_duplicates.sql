-- Remove duplicate peaks with old naming convention
DELETE FROM peaks WHERE slug IN ('mt-elbert', 'mt-massive');
