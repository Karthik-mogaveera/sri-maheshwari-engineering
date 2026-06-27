import { useEffect, useState } from 'react';
import api from '../api';
import {
  SettingCard,
  Field,
  TextInput,
  TextArea,
  ViewRow,
  Toast,
  fieldGrid
} from './shared';

export default function InformationTab() {
  const [data, setData] = useState({
    phone: '',
    email: '',
    address: '',
    map_url: ''
  });

  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);

  const [preview, setPreview] = useState({
    logo_url: '',
    favicon_url: ''
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/api/admin/settings/information');

      if (res.data.data) {
        setData(res.data.data);
        setPreview(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveData = async () => {
    try {
      setSaving(true);

      const formData = new FormData();

      Object.keys(data).forEach(key =>
        formData.append(key, data[key] || '')
      );

      if (logo) formData.append('logo', logo);
      if (favicon) formData.append('favicon', favicon);

      const res = await api.put(
        '/api/admin/settings/information',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setData(res.data.data);
      setPreview(res.data.data);

      setEditing(false);

      setToast({
        type: 'success',
        msg: 'Information saved successfully'
      });
    } catch {
      setToast({
        type: 'error',
        msg: 'Failed to save'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SettingCard
        title="Company Information"
        subtitle="Website logo, contact details and address"
        icon="🏢"
        isEditing={editing}
        saving={saving}
        hasData={!!data.email}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onSave={saveData}
      >
        {editing ? (
          <div style={fieldGrid}>
            <Field label="Phone">
              <TextInput
                value={data.phone || ''}
                onChange={e =>
                  setData({ ...data, phone: e.target.value })
                }
              />
            </Field>

            <Field label="Email">
              <TextInput
                value={data.email || ''}
                onChange={e =>
                  setData({ ...data, email: e.target.value })
                }
              />
            </Field>

            <Field label="Address">
              <TextArea
                value={data.address || ''}
                onChange={e =>
                  setData({ ...data, address: e.target.value })
                }
              />
            </Field>

            <Field label="Google Map URL">
              <TextInput
                value={data.map_url || ''}
                onChange={e =>
                  setData({ ...data, map_url: e.target.value })
                }
              />
            </Field>

            <Field label="Logo">
              <input
                type="file"
                accept="image/*"
                onChange={e => setLogo(e.target.files[0])}
              />
            </Field>

            <Field label="Favicon">
              <input
                type="file"
                accept="image/*"
                onChange={e => setFavicon(e.target.files[0])}
              />
            </Field>
          </div>
        ) : (
          <>
            {preview.logo_url && (
              <img
                src={preview.logo_url}
                alt=""
                style={{ height: 70, marginBottom: 15 }}
              />
            )}

            <ViewRow label="Phone" value={data.phone} />
            <ViewRow label="Email" value={data.email} />
            <ViewRow label="Address" value={data.address} />
            <ViewRow label="Map URL" value={data.map_url} isLink />
          </>
        )}
      </SettingCard>

      {toast && (
        <Toast
          {...toast}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}