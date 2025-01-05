-- Create franchises table
CREATE TABLE franchises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  owner_id UUID REFERENCES auth.users(id)
);

-- Create inventory_items table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT
);

-- Create franchise_inventory table
CREATE TABLE franchise_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  franchise_id UUID REFERENCES franchises(id),
  item_id UUID REFERENCES inventory_items(id),
  quantity INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  UNIQUE(franchise_id, item_id)
);

-- Create inventory_usage table
CREATE TABLE inventory_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  franchise_id UUID REFERENCES franchises(id),
  item_id UUID REFERENCES inventory_items(id),
  date DATE NOT NULL,
  quantity_used INTEGER NOT NULL
);

-- Create inventory_requests table
CREATE TABLE inventory_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  franchise_id UUID REFERENCES franchises(id),
  item_id UUID REFERENCES inventory_items(id),
  quantity_requested INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Fulfilled', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a view to get user information including metadata
CREATE OR REPLACE VIEW user_info AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type
FROM auth.users;

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_requests ENABLE ROW LEVEL SECURITY;

-- Policies for franchises
CREATE POLICY "Admins can do anything with franchises" ON franchises
  FOR ALL USING (
    (SELECT user_type FROM user_info WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Franchise owners can view their own franchise" ON franchises
  FOR SELECT USING (auth.uid() = owner_id);

-- Policies for inventory_items
CREATE POLICY "Anyone can view inventory items" ON inventory_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage inventory items" ON inventory_items
  FOR ALL USING (
    (SELECT user_type FROM user_info WHERE id = auth.uid()) = 'admin'
  );

-- Policies for franchise_inventory
CREATE POLICY "Admins can do anything with franchise inventory" ON franchise_inventory
  FOR ALL USING (
    (SELECT user_type FROM user_info WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Franchise owners can view their own inventory" ON franchise_inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM franchises
      WHERE franchises.id = franchise_inventory.franchise_id
      AND franchises.owner_id = auth.uid()
    )
  );

-- Policies for inventory_usage
CREATE POLICY "Admins can view all inventory usage" ON inventory_usage
  FOR SELECT USING (
    (SELECT user_type FROM user_info WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Franchise owners can manage their own inventory usage" ON inventory_usage
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM franchises
      WHERE franchises.id = inventory_usage.franchise_id
      AND franchises.owner_id = auth.uid()
    )
  );

-- Policies for inventory_requests
CREATE POLICY "Admins can manage all inventory requests" ON inventory_requests
  FOR ALL USING (
    (SELECT user_type FROM user_info WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Franchise owners can manage their own inventory requests" ON inventory_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM franchises
      WHERE franchises.id = inventory_requests.franchise_id
      AND franchises.owner_id = auth.uid()
    )
  );

