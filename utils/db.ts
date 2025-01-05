import { supabase } from './supabase'

export async function getFranchises() {
  try {
    const { data, error } = await supabase
      .from('franchises')
      .select('*')
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching franchises:', error)
    throw error
  }
}

export async function createFranchise(name: string, location: string, ownerId: string | null) {
  try {
    const franchiseData: { name: string; location: string; owner_id?: string } = { name, location }
    if (ownerId) {
      franchiseData.owner_id = ownerId
    }

    const { data, error } = await supabase
      .from('franchises')
      .insert(franchiseData)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error creating franchise:', error)
    throw error
  }
}

export async function getInventoryItems() {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    throw error
  }
}

export async function createInventoryItem(name: string, description: string) {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({ name, description })
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error creating inventory item:', error)
    throw error
  }
}

export async function updateInventoryItem(id: string, name: string, description: string) {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ name, description })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating inventory item:', error)
    throw error
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    throw error
  }
}

export async function getFranchiseInventory(franchiseId: string) {
  try {
    const { data, error } = await supabase
      .from('franchise_inventory')
      .select(`
        *,
        inventory_items (name, description)
      `)
      .eq('franchise_id', franchiseId)
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching franchise inventory:', error)
    throw error
  }
}

export async function updateFranchiseInventory(
  franchiseId: string,
  itemId: string,
  quantity: number,
  threshold: number
) {
  try {
    const { data, error } = await supabase
      .from('franchise_inventory')
      .upsert({
        franchise_id: franchiseId,
        item_id: itemId,
        quantity,
        threshold
      })
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating franchise inventory:', error)
    throw error
  }
}

export async function recordInventoryUsage(
  franchiseId: string,
  itemId: string,
  quantityUsed: number,
  date: string
) {
  try {
    const { data, error } = await supabase.rpc('record_inventory_usage', {
      p_franchise_id: franchiseId,
      p_item_id: itemId,
      p_quantity_used: quantityUsed,
      p_date: date
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error recording inventory usage:', error)
    throw error
  }
}

export async function createInventoryRequest(
  franchiseId: string,
  itemId: string,
  quantityRequested: number
) {
  try {
    const { data, error } = await supabase
      .from('inventory_requests')
      .insert({
        franchise_id: franchiseId,
        item_id: itemId,
        quantity_requested: quantityRequested,
        status: 'Pending'
      })
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error creating inventory request:', error)
    throw error
  }
}

export async function updateInventoryRequestStatus(requestId: string, status: 'Fulfilled' | 'Rejected') {
  try {
    const { data, error } = await supabase
      .from('inventory_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating inventory request status:', error)
    throw error
  }
}

export async function updateFranchiseOwner(franchiseId: string, ownerEmail: string) {
  try {
    // First, get the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('user_info')
      .select('id')
      .eq('email', ownerEmail)
      .single()

    if (userError) throw userError
    if (!userData) throw new Error('User not found')

    // Then, update the franchise with the new owner ID
    const { data, error } = await supabase
      .from('franchises')
      .update({ owner_id: userData.id })
      .eq('id', franchiseId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating franchise owner:', error)
    throw error
  }
}

export async function getRealTimeInventory(franchiseId: string) {
  try {
    const { data, error } = await supabase.rpc('get_real_time_inventory', {
      p_franchise_id: franchiseId
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching real-time inventory:', error)
    throw error
  }
}

export async function fulfillInventoryRequest(requestId: string, fulfilledQuantity: number) {
  try {
    const { data, error } = await supabase.rpc('fulfill_inventory_request', {
      p_request_id: requestId,
      p_fulfilled_quantity: fulfilledQuantity
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fulfilling inventory request:', error)
    throw error
  }
}

export async function getDayWiseInventoryUsage(franchiseId: string, startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase.rpc('get_day_wise_inventory_usage', {
      p_franchise_id: franchiseId,
      p_start_date: startDate,
      p_end_date: endDate
    })
    
    if (error) throw error

    // Convert BIGINT to number for JavaScript compatibility
    return data.map((item: { quantity_used: string | number }) => ({
      ...item,
      quantity_used: Number(item.quantity_used)
    }))
  } catch (error) {
    console.error('Error fetching day-wise inventory usage:', error)
    throw error
  }
}

// export {
//   getFranchises,
//   createFranchise,
//   getInventoryItems,
//   createInventoryItem,
//   updateInventoryItem,
//   deleteInventoryItem,
//   getFranchiseInventory,
//   updateFranchiseInventory,
//   recordInventoryUsage,
//   createInventoryRequest,
//   updateInventoryRequestStatus,
//   updateFranchiseOwner,
//   getRealTimeInventory,
//   fulfillInventoryRequest,
//   getDayWiseInventoryUsage
// }

