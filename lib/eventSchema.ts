import * as yup from 'yup';

export const eventSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  date: yup.string().required('Date is required').matches(/^\d{4}-\d{2}-\d{2}/, 'Date must be in YYYY-MM-DD format'),
  time: yup.string().optional(),
  location: yup.string().optional(),
  status: yup.string().oneOf(['upcoming', 'completed', 'cancelled']).optional(),
  category: yup.string().optional(),
});
