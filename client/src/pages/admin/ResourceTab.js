import { useMemo, useState } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import api, { getErrorMessage } from "../../api/client";
import useFetch from "../../hooks/useFetch";
import { useToast } from "../../context/ToastContext";
import Modal from "../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../components/ui/Feedback";

/**
 * Generic admin table with search, add / edit (modal form) and delete.
 *
 * fields:  [{ name, label, type?, required?, options?, hint?, createOnly? }]
 * columns: [{ key, label, render?(row) }]
 */
export default function ResourceTab({
  title,
  listUrl,
  select = (d) => d,
  columns,
  fields = [],
  createUrl,
  updateUrl,
  deleteUrl,
  multipart = false,
  toForm = (row) => row,
  noun = "item",
  headerExtra,
  searchKeys = [],
  canDelete = () => true,
}) {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(listUrl);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | row
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [changePassword, setChangePassword] = useState(false);

  const rows = useMemo(() => (data ? select(data) : []), [data, select]);
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(term)));
  }, [rows, search, searchKeys]);

  const openForm = (row) => {
    setEditing(row || "new");
    setForm(row ? toForm(row) : {});
    setFile(null);
    setFormError("");
    setChangePassword(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      const isNew = editing === "new";
      // An empty password means "keep the current one", so it is never sent.
      const values = { ...form };
      if (!values.password) delete values.password;
      let body = values;
      if (multipart) {
        body = new FormData();
        Object.entries(values).forEach(([k, v]) => v !== undefined && v !== null && body.append(k, v));
        if (file) body.append("img", file);
      }
      if (isNew) await api.post(createUrl, body);
      else await api.put(updateUrl(editing._id), body);
      toast.success(`${noun} ${isNew ? "added" : "updated"}`);
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete this ${noun}? This cannot be undone.`)) return;
    try {
      await api.delete(deleteUrl(row._id));
      toast.success(`${noun} deleted`);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const isNew = editing === "new";

  return (
    <div>
      <div className="toolbar">
        <h2>{title} <span className="badge">{rows.length}</span></h2>
        <div className="row">
          {searchKeys.length > 0 && (
            <div className="search">
              <FiSearch aria-hidden="true" />
              <input className="input" type="search" placeholder="Search..." aria-label={`Search ${title}`} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}
          {headerExtra?.(reload)}
          {createUrl && <button className="btn btn--primary btn--sm" onClick={() => openForm(null)}><FiPlus /> Add {noun}</button>}
        </div>
      </div>

      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : visible.length === 0 ? (
        <div className="card"><EmptyState title={`No ${title.toLowerCase()} found`} /></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}{(updateUrl || deleteUrl) && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row._id}>
                  {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? "-"}</td>)}
                  {(updateUrl || deleteUrl) && (
                    <td>
                      <div className="actions">
                        {updateUrl && <button className="icon-btn" aria-label={`Edit ${noun}`} onClick={() => openForm(row)}><FiEdit2 /></button>}
                        {deleteUrl && canDelete(row, rows) && <button className="icon-btn" aria-label={`Delete ${noun}`} style={{ color: "var(--danger)" }} onClick={() => remove(row)}><FiTrash2 /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={`${isNew ? "Add" : "Edit"} ${noun}`} onClose={() => setEditing(null)}>
          {formError && <div className="alert alert--error" role="alert">{formError}</div>}
          <form onSubmit={save}>
            {fields.filter((f) => !(f.createOnly && !isNew)).map((f) => (
              f.type === "password" && !isNew && !changePassword ? (
                // Not rendered at all until requested, so browsers cannot autofill a saved password into it.
                <div className="field" key={f.name}>
                  <span className="label">{f.label}</span>
                  <button type="button" className="btn btn--outline btn--sm" style={{ alignSelf: "flex-start" }} onClick={() => setChangePassword(true)}>
                    Reset password
                  </button>
                  <span className="hint">The current password stays unchanged unless you reset it.</span>
                </div>
              ) : (
              <div className="field" key={f.name}>
                <label htmlFor={`f-${f.name}`}>{f.label}</label>
                {f.type === "select" ? (
                  <select id={`f-${f.name}`} className="select" value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                    {f.options.map((o) => <option key={o} value={o}>{o || "-"}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea id={`f-${f.name}`} className="textarea" rows={3} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} required={f.required} />
                ) : f.type === "file" ? (
                  <input id={`f-${f.name}`} className="input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] || null)} />
                ) : (
                  <input
                    id={`f-${f.name}`}
                    className="input"
                    type={f.type || "text"}
                    value={form[f.name] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    required={f.required}
                    minLength={f.type === "password" ? 8 : undefined}
                    autoComplete={f.type === "password" ? "new-password" : "off"}
                    autoFocus={f.type === "password" && !isNew}
                  />
                )}
                {f.hint && <span className="hint">{f.hint}</span>}
              </div>
              )
            ))}
            <button className="btn btn--primary btn--block" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
