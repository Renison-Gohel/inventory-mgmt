-- Function to get day-wise inventory usage for a specific franchise
CREATE OR REPLACE FUNCTION public.get_day_wise_inventory_usage(
  p_franchise_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date DATE,
  item_id UUID,
  item_name TEXT,
  quantity_used BIGINT  -- Change this to BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    iu.date,
    iu.item_id,
    ii.name AS item_name,
    SUM(iu.quantity_used)::BIGINT AS quantity_used  -- Cast the sum to BIGINT
  FROM 
    inventory_usage iu
    JOIN inventory_items ii ON iu.item_id = ii.id
  WHERE 
    iu.franchise_id = p_franchise_id
    AND iu.date BETWEEN p_start_date AND p_end_date
  GROUP BY 
    iu.date, iu.item_id, ii.name
  ORDER BY 
    iu.date, ii.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

