import { useEffect, useState } from 'react';
import api from '../api';
import {
  SettingCard,
  Field,
  TextInput,
  Toggle,
  Toast
} from './shared';

export default function SecurityTab() {
  const [data, setData] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get('/api/admin/settings/security');
    setData(res.data.data || {});
  };

  const save = async () => {
    try {
      setSaving(true);

      await api.put('/api/admin/settings/security', data);

      setEditing(false);

      setToast({
        type: 'success',
        msg: 'Security settings saved'
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      await api.post(
        '/api/admin/settings/security/change-password',
        pwd
      );

      setPwd({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setToast({
        type: 'success',
        msg: 'Password changed'
      });
    } catch (err) {
      setToast({
        type: 'error',
        msg:
          err?.response?.data?.message ||
          'Failed'
      });
    }
  };

  return (
    <>
      <SettingCard
        title="Security"
        subtitle="Admin and authentication settings"
        icon="🔒"
        isEditing={editing}
        saving={saving}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onSave={save}
      >
        {editing ? (
          <>
            <Field label="Admin Email">
              <TextInput
                value={data.admin_email || ''}
                onChange={e =>
                  setData({
                    ...data,
                    admin_email: e.target.value
                  })
                }
              />
            </Field>

            <Toggle
              label="Two Factor Authentication"
              checked={!!data.two_factor_enabled}
              onChange={v =>
                setData({
                  ...data,
                  two_factor_enabled: v
                })
              }
            />

            <Toggle
              label="Maintenance Mode"
              checked={!!data.maintenance_mode}
              onChange={v =>
                setData({
                  ...data,
                  maintenance_mode: v
                })
              }
            />

            <Field label="Session Timeout (mins)">
              <TextInput
                value={data.session_timeout_mins || ''}
                onChange={e =>
                  setData({
                    ...data,
                    session_timeout_mins:
                      e.target.value
                  })
                }
              />
            </Field>

            <Field label="Login Attempts Limit">
              <TextInput
                value={data.login_attempts_limit || ''}
                onChange={e =>
                  setData({
                    ...data,
                    login_attempts_limit:
                      e.target.value
                  })
                }
              />
            </Field>
          </>
        ) : (
          <div>
            <p>Admin Email: {data.admin_email}</p>
            <p>2FA: {data.two_factor_enabled ? 'Enabled' : 'Disabled'}</p>
            <p>Maintenance: {data.maintenance_mode ? 'Enabled' : 'Disabled'}</p>
          </div>
        )}
      </SettingCard>

      <SettingCard
        title="Change Password"
        subtitle="Update administrator password"
        icon="🔑"
        hasData
      >
        <div style={{ display: 'grid', gap: 15 }}>
          <Field label="Current Password">
            <TextInput
              type="password"
              value={pwd.currentPassword}
              onChange={e =>
                setPwd({
                  ...pwd,
                  currentPassword: e.target.value
                })
              }
            />
          </Field>

          <Field label="New Password">
            <TextInput
              type="password"
              value={pwd.newPassword}
              onChange={e =>
                setPwd({
                  ...pwd,
                  newPassword: e.target.value
                })
              }
            />
          </Field>

          <Field label="Confirm Password">
            <TextInput
              type="password"
              value={pwd.confirmPassword}
              onChange={e =>
                setPwd({
                  ...pwd,
                  confirmPassword: e.target.value
                })
              }
            />
          </Field>

          <button
            onClick={changePassword}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: 8,
              background: '#14B8A6',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Change Password
          </button>
        </div>
      </SettingCard>

      {toast && (
        <Toast {...toast} onClose={() => setToast(null)} />
      )}
    </>
  );
}