import { useEffect, useState } from 'react';
import api from '../api';
import {
  SettingCard,
  Field,
  TextInput,
  TextArea,
  ViewRow,
  Toast
} from './shared';

export default function SEOTab() {
  const [data, setData] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get('/api/admin/settings/seo');
    setData(res.data.data || {});
  };

  const save = async () => {
    try {
      setSaving(true);

      await api.put('/api/admin/settings/seo', data);

      setEditing(false);

      setToast({
        type: 'success',
        msg: 'SEO settings saved'
      });
    } catch {
      setToast({
        type: 'error',
        msg: 'Save failed'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SettingCard
        title="SEO Settings"
        subtitle="Search engine optimization"
        icon="🔍"
        isEditing={editing}
        saving={saving}
        onEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onSave={save}
      >
        {editing ? (
          <div style={{ display: 'grid', gap: 18 }}>
            <Field label="Meta Title">
              <TextInput
                value={data.meta_title || ''}
                onChange={e =>
                  setData({
                    ...data,
                    meta_title: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Meta Description">
              <TextArea
                value={data.meta_description || ''}
                onChange={e =>
                  setData({
                    ...data,
                    meta_description: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Keywords">
              <TextArea
                value={data.meta_keywords || ''}
                onChange={e =>
                  setData({
                    ...data,
                    meta_keywords: e.target.value
                  })
                }
              />
            </Field>

            <Field label="OG Title">
              <TextInput
                value={data.og_title || ''}
                onChange={e =>
                  setData({
                    ...data,
                    og_title: e.target.value
                  })
                }
              />
            </Field>

            <Field label="OG Description">
              <TextArea
                value={data.og_description || ''}
                onChange={e =>
                  setData({
                    ...data,
                    og_description: e.target.value
                  })
                }
              />
            </Field>

            <Field label="OG Image URL">
              <TextInput
                value={data.og_image || ''}
                onChange={e =>
                  setData({
                    ...data,
                    og_image: e.target.value
                  })
                }
              />
            </Field>

            <Field label="Canonical URL">
              <TextInput
                value={data.canonical_url || ''}
                onChange={e =>
                  setData({
                    ...data,
                    canonical_url: e.target.value
                  })
                }
              />
            </Field>
          </div>
        ) : (
          <>
            <ViewRow label="Meta Title" value={data.meta_title} />
            <ViewRow label="Meta Description" value={data.meta_description} />
            <ViewRow label="Keywords" value={data.meta_keywords} />
            <ViewRow label="OG Title" value={data.og_title} />
            <ViewRow label="Canonical URL" value={data.canonical_url} isLink />
          </>
        )}
      </SettingCard>

      {toast && (
        <Toast {...toast} onClose={() => setToast(null)} />
      )}
    </>
  );
}