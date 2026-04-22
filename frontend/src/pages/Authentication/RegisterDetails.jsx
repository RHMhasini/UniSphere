import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import {
  STUDENT_FACULTIES,
  LECTURER_FACULTIES,
  TECHNICIAN_DEPARTMENTS,
} from '../../utils/dropdownData';
import {
  Building2,
  ShieldCheck,
  Loader2,
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  Phone,
  Building,
  BookOpen,
  Calendar,
  BadgeCheck,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

const ROLES = [
  { id: 'STUDENT', label: 'Student', icon: <GraduationCap className="h-5 w-5" />, desc: 'Book labs & rooms, report faults, track your requests' },
  { id: 'LECTURER', label: 'Lecturer', icon: <Briefcase className="h-5 w-5" />, desc: 'Reserve spaces, request equipment, coordinate work orders' },
  { id: 'TECHNICIAN', label: 'Technician', icon: <Wrench className="h-5 w-5" />, desc: 'Handle work orders, log assets, close maintenance tickets' }
];

const RegisterDetails = () => {
  const { user, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'STUDENT',
    password: '',
    confirmPassword: '',
    gender: '', // For Student
    studentId: '',
    faculty: '',
    degreeProgram: '',
    year: '',
    semester: '',
    staffId: '',
    title: '', // For Lecturer
    department: '',
    designation: '', // For Lecturer
    specialization: '', // For Technician
    assignedLab: '', // For Technician
  });

  const enforcedRole = React.useMemo(() => {
    if (!user?.email) return null;
    if (/^[A-Za-z]{2}[0-9]{8}@my\.sliit\.lk$/.test(user.email)) return 'STUDENT';
    if (/^[a-zA-Z0-9._%+-]+lec@gmail\.com$/.test(user.email)) return 'LECTURER';
    if (/^[a-zA-Z0-9._%+-]+tec@gmail\.com$/.test(user.email)) return 'TECHNICIAN';
    return null;
  }, [user?.email]);

  useEffect(() => {
    if (enforcedRole) {
      setFormData(prev => ({ ...prev, role: enforcedRole }));
      
      if (enforcedRole === 'STUDENT' && user?.email) {
        const newId = user.email.split('@')[0].toUpperCase();
        setFormData(prev => {
          if (prev.studentId === newId) return prev;
          return { ...prev, studentId: newId };
        });
      }
    }
  }, [enforcedRole, user?.email]);

  const [formErrors, setFormErrors] = useState({});

  // Dynamic dropdown state for options available based on parent selection
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableDegrees, setAvailableDegrees] = useState([]);
  const [availableSpecializations, setAvailableSpecializations] = useState([]);
  const [availableLabs, setAvailableLabs] = useState([]);

  // Validators
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
  const validateStudentEmail = (email) => /^[A-Za-z]{2}[0-9]{8}@my\.sliit\.lk$/.test(email);
  const validateLecturerEmail = (email) => /^[a-zA-Z0-9._%+-]+lec@gmail\.com$/.test(email);
  const validateTechnicianEmail = (email) => /^[a-zA-Z0-9._%+-]+tec@gmail\.com$/.test(email);
  const validateLecturerID = (id) => /^Lec-\d{4}$/.test(id);
  const validateTechnicianID = (id) => /^Tec-\d{4}$/.test(id);

  const validateField = (name, value, role) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return validateName(value) ? '' : `${name === 'firstName' ? 'First' : 'Last'} name must contain only letters and spaces`;
      case 'phone':
        return validatePhone(value) ? '' : 'Phone number must include exactly 10 digits';
      case 'studentId':
        return value.trim() ? '' : 'Student ID is required';
      case 'staffId':
        if (role === 'LECTURER') return validateLecturerID(value) ? '' : 'Invalid Lecturer ID format (e.g. Lec-XXXX)';
        if (role === 'TECHNICIAN') return validateTechnicianID(value) ? '' : 'Invalid Technician ID format (e.g. Tec-XXXX)';
        return value.trim() ? '' : 'Staff ID is required';
      case 'password':
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
      case 'confirmPassword':
        return value === formData.password ? '' : 'Passwords do not match';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Strict input filtering
    if (name === 'firstName' || name === 'lastName') {
      value = value.replace(/[^A-Za-z\s]/g, '');
    }
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Cascading updates
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-fill studentId when role switches to STUDENT if email is valid
      if (name === 'role' && value === 'STUDENT' && user?.email && validateStudentEmail(user.email)) {
         updated.studentId = user.email.split('@')[0].toUpperCase();
      }

      if (updated.role === 'STUDENT') {
        if (name === 'faculty') {
          updated.degreeProgram = '';
          setAvailableDegrees(STUDENT_FACULTIES[value] || []);
        }
      } else if (updated.role === 'LECTURER') {
        if (name === 'faculty') {
          updated.department = '';
          setAvailableDepartments(LECTURER_FACULTIES[value] || []);
        }
      } else if (updated.role === 'TECHNICIAN') {
        if (name === 'department') {
          updated.specialization = '';
          updated.assignedLab = '';
          const selectedDepartmentData = TECHNICIAN_DEPARTMENTS[value];
          setAvailableSpecializations(selectedDepartmentData ? selectedDepartmentData.specializations : []);
        } else if (name === 'specialization') {
          updated.assignedLab = '';
          const selectedDepartmentData = TECHNICIAN_DEPARTMENTS[updated.department];
          if (selectedDepartmentData) {
            setAvailableLabs(selectedDepartmentData.labs || []);
          }
        }
      }

      // Automatically validate mapped fields
      const fieldError = validateField(name, value, updated.role);
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: fieldError
      }));

      return updated;
    });
  };

  const isFormValid = (showErrors = false) => {
    if (!user || !user.email) return false;

    // Validate email constraints against role explicitly securely
    if (formData.role === 'STUDENT' && !validateStudentEmail(user.email)) {
       if (showErrors) setError("Your Google email is not a valid student email (requires ITxxxx@my.sliit.lk)");
       return false;
    }
    if (formData.role === 'LECTURER' && !validateLecturerEmail(user.email)) {
       if (showErrors) setError("Your Google email is not a valid lecturer email (requires *lec@gmail.com)");
       return false;
    }
    if (formData.role === 'TECHNICIAN' && !validateTechnicianEmail(user.email)) {
       if (showErrors) setError("Your Google email is not a valid technician email (requires *tec@gmail.com)");
       return false;
    }

    // Validate required fields
    const requiredGeneral = ['firstName', 'lastName', 'phone', 'password', 'confirmPassword'];
    const requiredStudent = ['studentId', 'gender', 'faculty', 'degreeProgram', 'year', 'semester'];
    const requiredLecturer = ['staffId', 'title', 'faculty', 'department', 'designation'];
    const requiredTechnician = ['staffId', 'department', 'specialization', 'assignedLab'];

    const checkFields = (fields) => fields.every((f) => formData[f] && formData[f].trim() !== '');

    if (!checkFields(requiredGeneral)) return false;

    if (formData.role === 'STUDENT' && !checkFields(requiredStudent)) return false;
    if (formData.role === 'LECTURER' && !checkFields(requiredLecturer)) return false;
    if (formData.role === 'TECHNICIAN' && !checkFields(requiredTechnician)) return false;

    // Cross-validate email and ID dynamically to prevent role-switching bypass
    if (validateField('email', user?.email, formData.role)) return false;
    if (formData.role === 'LECTURER' || formData.role === 'TECHNICIAN') {
       if (validateField('staffId', formData.staffId, formData.role)) return false;
    }

    // Check if any specific field has an active error
    if (Object.values(formErrors).some(err => err !== '')) return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid(true)) return;
    
    setError(null);
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        profilePictureUrl: user?.profilePictureUrl,
        ...(formData.role === 'STUDENT' && {
          studentId: formData.studentId,
          faculty: formData.faculty,
          degreeProgram: formData.degreeProgram,
          year: formData.year,
          semester: formData.semester
        }),
        ...(formData.role === 'LECTURER' && {
          staffId: formData.staffId,
          faculty: formData.faculty,
          department: formData.department,
          designation: formData.designation
        }),
        ...(formData.role === 'TECHNICIAN' && {
          staffId: formData.staffId,
          department: formData.department,
          specialization: formData.specialization,
          assignedLab: formData.assignedLab
        })
      };

      await authAPI.submitAdditionalDetails(payload);
      await fetchCurrentUser();
      
      if (formData.role === 'STUDENT') {
        navigate('/dashboard');
      } else {
        navigate('/register/pending');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit additional details');
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'STUDENT':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Student ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BadgeCheck className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="text" name="studentId" required value={formData.studentId} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${formErrors.studentId ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="ITXXXXXXXX" />
                </div>
                {formErrors.studentId && <p className="text-xs text-red-500">{formErrors.studentId}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Faculty</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="faculty" required value={formData.faculty} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Faculty</option>
                    {Object.keys(STUDENT_FACULTIES).map((faculty) => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Degree Program</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="degreeProgram" required value={formData.degreeProgram} onChange={handleChange} disabled={!formData.faculty} className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Degree</option>
                    {availableDegrees.map((degree) => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Year</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="year" required value={formData.year} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Year</option>
                    {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Semester</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="semester" required value={formData.semester} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Semester</option>
                    {['Semester 1', 'Semester 2'].map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'LECTURER':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="title" required value={formData.title} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Title</option>
                    {['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'].map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Staff ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BadgeCheck className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="text" name="staffId" required value={formData.staffId} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${formErrors.staffId ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="Lec-XXXX" />
                </div>
                {formErrors.staffId && <p className="text-xs text-red-500">{formErrors.staffId}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Faculty</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="faculty" required value={formData.faculty} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Faculty</option>
                    {Object.keys(LECTURER_FACULTIES).map((faculty) => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="department" required value={formData.department} onChange={handleChange} disabled={!formData.faculty} className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Department</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position / Designation</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="designation" required value={formData.designation} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Position</option>
                    {['Lecturer', 'Senior Lecturer', 'Professor', 'Assistant Professor', 'Visiting Lecturer'].map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'TECHNICIAN':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Staff ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BadgeCheck className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="text" name="staffId" required value={formData.staffId} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${formErrors.staffId ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="Tec-XXXX" />
                </div>
                {formErrors.staffId && <p className="text-xs text-red-500">{formErrors.staffId}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="department" required value={formData.department} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Department</option>
                    {Object.keys(TECHNICIAN_DEPARTMENTS).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position / Specialization</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Wrench className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="specialization" required value={formData.specialization} onChange={handleChange} disabled={!formData.department} className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Position</option>
                    {availableSpecializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assigned Lab / Workshop</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="assignedLab" required value={formData.assignedLab} onChange={handleChange} disabled={!formData.specialization} className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <option value="" disabled>Select Assigned Lab</option>
                    {availableLabs.map((lab) => (
                      <option key={lab} value={lab}>{lab}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="dashboard-wrapper min-h-screen mesh-background py-10">
      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        
        {/* === MAIN CARD CONTAINER === */}
        {/* CSS Explanation: 
            - max-w-4xl: Limits maximum width of the card 
            - bg-white/40 (and dark:bg-slate-900/40): Transparent background color
            - backdrop-blur-3xl: Creates the modern frosted Glassmorphism effect 
            - rounded-2xl shadow-xl: Curves extreme corners and adds a large elegant shadow 
        */}
        <div className="w-full max-w-4xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
           
           {/* === LEFT PANEL: Registration Info === */}
           {/* CSS Explanation: bg-slate-900 (Dark background), hidden md:flex (Hides on mobile, shows on tablets/desktops) */}
          <div className="hidden md:flex md:w-[40%] bg-slate-900 px-8 py-12 flex-col justify-between text-white relative overflow-hidden">
             
             {/* Circular spotlight gradient effect behind text */}
             <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(99,102,241,0.35),transparent)]" />
             <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center text-[28px] leading-none font-bold text-indigo-400 mb-0.5">
                    ◈
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-200">UniSphere</p>
                    <p className="text-xs text-slate-400">Smart Campus</p>
                  </div>
                </div>
                <h2 className="mt-12 text-3xl font-semibold leading-tight text-white">One last step.</h2>
                <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                  Pick your role so we can set up the right experience for you. Students, lecturers, and technicians each get a dashboard built around how they use the campus.
                </p>
             </div>
             <div className="relative z-10 mt-10">
               <ShieldCheck className="h-10 w-10 text-indigo-400 mb-3" />
               <p className="text-sm font-medium">Secured with your institutional Google account.</p>
             </div>
          </div>

          <div className="flex flex-1 flex-col py-10 px-8 sm:px-12 bg-white/50 dark:bg-slate-900/50">
            <div className="mb-8">
               <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Profile Details</h2>
               <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Almost there! Complete the fields below.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
              
              {/* Profile Image Preview from Google */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img 
                      src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=random`} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                <span className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">Profile Photo</span>
                <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">(Synced from your Google Account)</span>
              </div>

               {/* === SECTION 1: ROLE SELECTION === */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Select Your Role</h3>
                
                {/* CSS Explanation: grid-cols-1 md:grid-cols-3 (Shows roles in 1 column on mobile, 3 columns side-by-side on desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ROLES.map((role) => {
                    const isLocked = enforcedRole && enforcedRole !== role.id;
                    const isSelected = formData.role === role.id;
                    
                    // CSS for Role Boxes:
                    // - isSelected ? 'border-indigo-600 bg-indigo-50/50' : Highlights the selected role box in purple
                    // - hover:bg-slate-50: Light gray background when hovering over unselected roles 
                    // - isLocked ? 'opacity-50 cursor-not-allowed': Fades out locked roles and changes mouse cursor 
                    return (
                    <div
                      key={role.id}
                      onClick={() => !isLocked && setFormData({ ...formData, role: role.id, faculty: '', department: '', degreeProgram: '', semester: '', year: '', staffId: '', studentId: '', assignedLab: '', specialization: '' })}
                      className={`relative flex rounded-xl border p-4 shadow-sm transition-all ${
                        isLocked 
                          ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800' 
                          : 'cursor-pointer focus:outline-none ' + (isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 dark:bg-indigo-900/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700')
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <div className={`${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                              {role.icon}
                            </div>
                            <span className={`block text-sm font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-slate-200'}`}>
                              {role.label}
                            </span>
                          </div>
                          <span className={`mt-2 block text-xs ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>
                            {role.desc}
                          </span>
                          {isLocked && (
                            <div className="mt-3 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                              Locked
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>

              {/* === SECTION 2: BASIC INFO INPUTS === */}
              <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Basic Info</h3>
                 
                 {/* grid-cols-2 puts the inputs in two side-by-side columns on desktop */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></span>
                       
                       {/* CSS for standard text inputs: 
                           - pl-10: Left padding to make room for the icon
                           - border rounded-lg: Standard border with specifically curved edges
                           - focus:ring-indigo-500: Turns border thick purple on click 
                       */}
                       <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${formErrors.firstName ? 'border-red-500' : ''}`} placeholder="John" />
                    </div>
                    {formErrors.firstName && <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>}
                   </div>
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></span>
                       <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${formErrors.lastName ? 'border-red-500' : ''}`} placeholder="Doe" />
                    </div>
                    {formErrors.lastName && <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>}
                   </div>
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address (Read-only)</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-slate-400" /></span>
                       <input 
                          type="email" 
                          name="email" 
                          readOnly 
                          value={user?.email || ""} 
                          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed" 
                       />
                    </div>
                   </div>
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-slate-400" /></span>
                       <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${formErrors.phone ? 'border-red-500' : ''}`} placeholder="07XXXXXXXX" />
                    </div>
                    {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                   </div>
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ShieldCheck className="h-4 w-4 text-slate-400" /></span>
                       <input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" required value={formData.password} onChange={handleChange} className={`w-full pl-10 pr-10 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${formErrors.password ? 'border-red-500' : ''}`} placeholder="••••••••" />
                       <button
                         type="button"
                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                         onClick={() => setShowPassword(!showPassword)}
                       >
                         {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                       </button>
                    </div>
                    {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                   </div>
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ShieldCheck className="h-4 w-4 text-slate-400" /></span>
                       <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className={`w-full pl-10 pr-10 py-2 border rounded-lg hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${formErrors.confirmPassword ? 'border-red-500' : ''}`} placeholder="••••••••" />
                       <button
                         type="button"
                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       >
                         {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                       </button>
                    </div>
                    {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>}
                   </div>
                 </div>
              </div>

              {/* Specific details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Role Specific Details</h3>
                <AnimatePresence mode="wait">
                  {renderRoleSpecificFields()}
                </AnimatePresence>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                 <button
                   type="submit"
                   disabled={loading || !isFormValid()}
                   className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BadgeCheck className="w-5 h-5" />}
                   {loading ? 'Submitting...' : 'Complete Profile Setup'}
                 </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterDetails;
