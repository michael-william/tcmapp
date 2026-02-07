/**
 * UserManagement Page
 *
 * User management for InterWorks users (create/delete guests).
 */

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { ClientSelector } from '@/components/molecules/ClientSelector';
import { MultiClientSelector } from '@/components/molecules/MultiClientSelector';
import api from '@/lib/api';
import { Plus, Trash2, Loader2, User, Edit, Users } from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Form state (used for both create and edit)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientIds, setClientIds] = useState([]);
  const [role, setRole] = useState('guest'); // Default to guest
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!name || !email || !password) {
      setFormError('Name, email, and password are required');
      return;
    }

    // Client required for guest users
    if (role === 'guest' && clientIds.length === 0) {
      setFormError('Guest users must be assigned to at least one client');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    setCreateLoading(true);

    try {
      const response = await api.post('/users', {
        name,
        email,
        password,
        role,
        clientIds,
      });

      if (response.data.user) {
        setUsers([...users, response.data.user]);
        setIsCreateModalOpen(false);
        resetForm();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setName(user.name || '');
    setEmail(user.email || '');
    setPassword(''); // Leave blank for "no change"
    setRole(user.role || 'guest');
    setClientIds(user.clientIds?.map(c => c._id || c) || []);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!name || !email) {
      setFormError('Name and email are required');
      return;
    }

    // Client required for guest users
    if (role === 'guest' && clientIds.length === 0) {
      setFormError('Guest users must be assigned to at least one client');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (password && password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    setEditLoading(true);

    try {
      const payload = {
        name,
        email,
        role,
        clientIds,
      };

      // Only include password if it's been entered
      if (password) {
        payload.password = password;
      }

      const response = await api.put(`/users/${editingUser._id}`, payload);

      if (response.data.user) {
        setUsers(users.map(u => u._id === editingUser._id ? response.data.user : u));
        setIsEditModalOpen(false);
        setEditingUser(null);
        resetForm();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      // Try to delete - if InterWorks user with migrations, will get 409
      await api.delete(`/users/${user._id}`);
      setUsers(users.filter((u) => u._id !== user._id));
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.requiresForce) {
        // Show warning and confirm
        const message = err.response.data.message;
        const confirmed = confirm(
          `${message}\n\nAre you sure you want to delete this user?`
        );

        if (confirmed) {
          // Retry with force flag
          try {
            await api.delete(`/users/${user._id}?force=true`);
            setUsers(users.filter((u) => u._id !== user._id));
          } catch (retryErr) {
            console.error('Error deleting user with force:', retryErr);
            setError(retryErr.response?.data?.message || 'Failed to delete user');
          }
        }
      } else {
        console.error('Error deleting user:', err);
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setClientIds([]);
    setRole('guest'); // Reset to default
    setFormError('');
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    resetForm();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-white/70 mt-1">
              Manage guest users and permissions
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New User
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No users found. Create your first user to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.clientIds && user.clientIds.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {user.clientIds.length === 1
                                ? user.clientIds[0].name || 'Client'
                                : `${user.clientIds.length} Clients`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'interworks' ? 'default' : 'secondary'}>
                        {user.role === 'interworks' ? 'InterWorks' : 'Guest'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                        className="gap-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 py-4">
            {/* Error */}
            {formError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={createLoading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                disabled={createLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                disabled={createLoading}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>User Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  if (value === 'interworks') {
                    setClientIds([]); // Clear clients for InterWorks users
                  }
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guest" id="role-guest" />
                  <Label htmlFor="role-guest" className="font-normal cursor-pointer">
                    Guest User
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="interworks" id="role-interworks" />
                  <Label htmlFor="role-interworks" className="font-normal cursor-pointer">
                    InterWorks User
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {role === 'guest'
                  ? 'Guest users can only access their assigned clients\' migrations.'
                  : 'InterWorks users have full access to all clients.'}
              </p>
            </div>

            {/* Client Selection */}
            <MultiClientSelector
              values={clientIds}
              onValuesChange={setClientIds}
              required={role === 'guest'}
              disabled={createLoading}
              label={role === 'guest' ? 'Assign to Clients' : 'Assign to Clients (Optional)'}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditUser} className="space-y-4 py-4">
            {/* Error */}
            {formError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={editLoading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                disabled={editLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                disabled={editLoading}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep the current password
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>User Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  if (value === 'interworks') {
                    setClientIds([]); // Clear clients for InterWorks users
                  }
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guest" id="edit-role-guest" />
                  <Label htmlFor="edit-role-guest" className="font-normal cursor-pointer">
                    Guest User
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="interworks" id="edit-role-interworks" />
                  <Label htmlFor="edit-role-interworks" className="font-normal cursor-pointer">
                    InterWorks User
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {role === 'guest'
                  ? 'Guest users can only access their assigned clients\' migrations.'
                  : 'InterWorks users have full access to all clients.'}
              </p>
            </div>

            {/* Client Selection */}
            <MultiClientSelector
              values={clientIds}
              onValuesChange={setClientIds}
              required={role === 'guest'}
              disabled={editLoading}
              label={role === 'guest' ? 'Assign to Clients' : 'Assign to Clients (Optional)'}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditModal}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
