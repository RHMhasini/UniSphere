import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AdminResourceForm from '../../facilitiesPages/AdminResourceForm';
import ResourceCategoryHub from '../../facilitiesPages/ResourceCategoryHub';

const ResourcesPage = () => {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <AdminResourceForm />;
  }

  if (user?.role === 'STUDENT' || user?.role === 'LECTURER') {
    return <ResourceCategoryHub />;
  }

  return <Navigate to="/access-denied" replace />;
};

export default ResourcesPage;
