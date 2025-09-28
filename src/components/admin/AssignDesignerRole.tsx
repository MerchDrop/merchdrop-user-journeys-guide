import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AssignDesignerRole = () => {
  const { user, assignRole } = useAuth();

  const handleAssignDesignerRole = async () => {
    if (!user) {
      toast.error('You must be logged in to assign a role');
      return;
    }

    try {
      // First assign the role using the new API
      const { error: roleError } = await assignRole({
        userId: user.id,
        role: 'designer'
      });
      
      if (roleError) {
        throw roleError;
      }

      // Then create designer profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('designer_profiles')
        .upsert({
          user_id: user.id,
          designer_name: user.user_metadata?.display_name || user.email || 'Designer',
          bio: 'Admin user with designer access'
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Designer profile creation error:', profileError);
        // Don't throw as role assignment succeeded
      }

      toast.success('Designer role assigned successfully! You can now access the designer dashboard.');
      
      // Refresh the page to update role state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error assigning designer role:', error);
      toast.error('Failed to assign designer role: ' + error.message);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Assign Designer Role</CardTitle>
        <CardDescription>
          Click the button below to assign yourself the designer role and access the designer dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAssignDesignerRole} className="w-full">
          Assign Designer Role
        </Button>
      </CardContent>
    </Card>
  );
};