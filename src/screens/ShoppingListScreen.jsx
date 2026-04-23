import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ShoppingListScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setItems(data || []);
      }
    }
    setLoading(false);
  };

  const toggleItem = async (id, currentStatus) => {
    // 1. Optimistically update the UI instantly for a snappy feel
    setItems(items.map(item => 
      item.id === id ? { ...item, is_bought: !currentStatus } : item
    ));

    // 2. Update the database in the background
    const { error } = await supabase
      .from('shopping_list')
      .update({ is_bought: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error("Failed to update item");
      fetchList(); // Revert UI if it fails
    }
  };

  const clearCompleted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Remove from UI instantly
    setItems(items.filter(item => !item.is_bought));

    // Delete from database
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .match({ user_id: user.id, is_bought: true });

    if (error) {
      toast.error("Failed to clear items");
      fetchList();
    } else {
      toast.success("List cleaned up! 🧹");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-color)' }}>Loading your list...</div>;

  const activeItems = items.filter(i => !i.is_bought);
  const completedItems = items.filter(i => i.is_bought);

  return (
    // 🚨 Modified padding so it sits flush inside the Kitchen tab
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '10px 0' }}>
      
      {/* 🚨 Removed the <h1> tag and aligned the Clear button to the right */}
      {completedItems.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <button 
            onClick={clearCompleted}
            style={{ 
              background: 'none', color: '#d32f2f', border: 'none', 
              fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' 
            }}
          >
            Clear Completed
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-color)', opacity: 0.7 }}>
          <span style={{ fontSize: '50px' }}>🛒</span>
          <p>Your shopping list is empty.</p>
          <p>Go to a recipe and tap "Add to Shopping List"!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* TO BUY SECTION */}
          <AnimatePresence>
            {activeItems.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => toggleItem(item.id, item.is_bought)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '15px',
                  padding: '16px', background: 'var(--hover-bg, #f8f9fa)',
                  borderRadius: '12px', border: '1px solid var(--border-color, #eaeaea)',
                  cursor: 'pointer', color: 'var(--text-color)'
                }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--accent-color, #0095f6)' }}></div>
                <span style={{ fontWeight: 'bold' }}>{item.amount}</span> 
                <span>{item.ingredient_name}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* COMPLETED SECTION */}
          {completedItems.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: 'var(--text-color)', opacity: 0.6, fontSize: '14px', textTransform: 'uppercase' }}>Completed</h3>
              <AnimatePresence>
                {completedItems.map(item => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => toggleItem(item.id, item.is_bought)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '15px',
                      padding: '12px 16px', cursor: 'pointer', color: 'var(--text-color)',
                      textDecoration: 'line-through' 
                    }}
                  >
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-color, #0095f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✓</div>
                    <span style={{ fontWeight: 'bold' }}>{item.amount}</span> 
                    <span>{item.ingredient_name}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ShoppingListScreen;