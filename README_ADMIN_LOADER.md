Admin Loader

This project includes a simple centralized admin loading overlay to show progress during CRUD operations.

Provider
- The `AdminLoaderProvider` is wired into `components/admin/AdminLayout.tsx` so all admin pages can use the hook.

Hook
- `useAdminLoader()` returns { isLoading, message, show, hide }.

Pattern
- Example usage in an async CRUD handler inside an admin page/component:

```tsx
const { show, hide } = useAdminLoader();

const onSave = async () => {
  try {
    show('Saving...');
    await api.saveItem(payload);
  } finally {
    hide();
  }
};
```

Notes
- The loader supports nesting: multiple `show()` calls require the same number of `hide()` calls to dismiss the overlay.
- Keep messages short; the overlay is centered and modal.
