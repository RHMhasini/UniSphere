import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  STUDENT_FACULTIES,
  LECTURER_FACULTIES,
  TECHNICIAN_DEPARTMENTS,
} from '../utils/dropdownData';
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
  Lock
} from 'lucide-react';

const ROLES = [
  { id: 'STUDENT', label: 'Student', icon: <GraduationCap className="h-5 w-5" />, desc: 'Access course materials & schedules' },
  { id: 'LECTURER', label: 'Lecturer', icon: <Briefcase className="h-5 w-5" />, desc: 'Manage courses & view resources' },
  { id: 'TECHNICIAN', label: 'Technician', icon: <Wrench className="h-5 w-5" />, desc: 'Handle equipment & support' }
];

const Register = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
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

  const [formErrors, setFormErrors] = useState({});

  // Dynamic dropdown state for options available based on parent selection
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableDegrees, setAvailableDegrees] = useState([]);
  const [availableSpecializations, setAvailableSpecializations] = useState([]);
  const [availableLabs, setAvailableLabs] = useState([]);

  // Validators
  const validateName = (name) => /^[A-Za-z\s]{2,50}$/.test(name);
  const validatePhone = (phone) => /^(?:7|0|(?:\+94))[0-9]{9,10}$/.test(phone);
  const validateID = (id) => /^[A-Za-z0-9-]{4,20}$/.test(id);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return validateName(value) ? '' : `${name === 'firstName' ? 'First' : 'Last'} name must contain only letters and be 2-50 characters long`;
      case 'phone':
        return validatePhone(value) ? '' : 'Please enter a valid Sri Lankan phone number';
      case 'email':
        return validateEmail(value) ? '' : 'Please enter a valid email address';
      case 'studentId':
      case 'staffId':
        return validateID(value) ? '' : 'ID must be 4-20 alphanumeric characters';
      case 'password':
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
      case 'confirmPassword':
        return value === formData.password ? '' : 'Passwords do not match';
      default:
        return '';
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    googleLogin();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Cascading updates
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

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
      const fieldError = validateField(name, value);
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: fieldError
      }));

      return updated;
    });
  };

  const isFormValid = () => {
    // Validate required fields
    const requiredGeneral = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    const requiredStudent = ['studentId', 'gender', 'faculty', 'degreeProgram', 'year', 'semester'];
    const requiredLecturer = ['staffId', 'title', 'faculty', 'department', 'designation'];
    const requiredTechnician = ['staffId', 'department', 'specialization', 'assignedLab'];

    const checkFields = (fields) => fields.every((f) => formData[f] && formData[f].trim() !== '');

    if (!checkFields(requiredGeneral)) return false;

    if (formData.role === 'STUDENT' && !checkFields(requiredStudent)) return false;
    if (formData.role === 'LECTURER' && !checkFields(requiredLecturer)) return false;
    if (formData.role === 'TECHNICIAN' && !checkFields(requiredTechnician)) return false;

    // Check if any specific field has an active error
    if (Object.values(formErrors).some(err => err !== '')) return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      navigate('/register/pending');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to register account');
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
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg">
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
                  <input type="text" name="studentId" required value={formData.studentId} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg ${formErrors.studentId ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="STU-2024-001" />
                </div>
                {formErrors.studentId && <p className="text-xs text-red-500">{formErrors.studentId}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Faculty</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="faculty" required value={formData.faculty} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg">
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
                  <select name="degreeProgram" required value={formData.degreeProgram} onChange={handleChange} disabled={!formData.faculty} className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed">
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
                  <select name="year" required value={formData.year} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg">
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
                  <select name="semester" required value={formData.semester} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg">
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
                  <select name="title" required value={formData.title} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg">
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
                  <input type="text" name="staffId" required value={formData.staffId} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg ${formErrors.staffId ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="STF-2024-001" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Faculty</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="faculty" required value={formData.faculty} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg">
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
                  <select name="department" required value={formData.department} onChange={handleChange} disabled={!formData.faculty} className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed">
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
                  <select name="designation" required value={formData.designation} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg">
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
                  <input type="text" name="staffId" required value={formData.staffId} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg ${formErrors.staffId ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="TECH-2024-001" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <select name="department" required value={formData.department} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-lg">
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
                  <select name="specialization" required value={formData.specialization} onChange={handleChange} disabled={!formData.department} className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed">
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
                  <select name="assignedLab" required value={formData.assignedLab} onChange={handleChange} disabled={!formData.specialization} className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed">
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
        
        <div className="w-full max-w-4xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
           {/* Left Panel */}
          <div className="hidden md:flex md:w-[40%] bg-slate-900 px-8 py-12 flex-col justify-between text-white relative overflow-hidden">
             <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(99,102,241,0.35),transparent)]" />
             <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                    <Building2 className="h-6 w-6 text-indigo-200" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-200">UniSphere</p>
                    <p className="text-xs text-slate-400">Smart Campus</p>
                  </div>
                </div>
                <h2 className="mt-12 text-3xl font-semibold leading-tight text-white">Join the operations hub.</h2>
                <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                  Create an account to manage classes, facilities, resources, and help shape the future of your campus.
                </p>
             </div>
             <div className="relative z-10 mt-10">
               <ShieldCheck className="h-10 w-10 text-indigo-400 mb-3" />
               <p className="text-sm font-medium">Secured with Enterprise-Grade encryption.</p>
             </div>
          </div>

          <div className="flex flex-1 flex-col py-10 px-8 sm:px-12 bg-white/50 dark:bg-slate-900/50">
            <div className="mb-8">
               <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
               <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Get started completely free.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
              {/* Profile Image Preview (Auto-generated) */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${formData.firstName || 'U'}+${formData.lastName || 'S'}&background=random`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                <span className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">Profile Photo</span>
                <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">(Auto-generated from your name)</span>
              </div>

              {/* Profile Basics */}
              <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Basic Info</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></span>
                       <input type="text" name="firstName" required autoComplete="off" value={formData.firstName} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg ${formErrors.firstName ? 'border-red-500' : ''}`} placeholder="John" />
                    </div>
                   </div>
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></span>
                       <input type="text" name="lastName" required autoComplete="off" value={formData.lastName} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg ${formErrors.lastName ? 'border-red-500' : ''}`} placeholder="Doe" />
                    </div>
                   </div>
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-slate-400" /></span>
                       <input type="email" name="email" required autoComplete="off" value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg ${formErrors.email ? 'border-red-500' : ''}`} placeholder="john@unisphere.edu" />
                    </div>
                   </div>
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-slate-400" /></span>
                       <input type="tel" name="phone" required autoComplete="off" value={formData.phone} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg ${formErrors.phone ? 'border-red-500' : ''}`} placeholder="07XXXXXXXX" />
                    </div>
                   </div>

                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></span>
                       <input type="password" name="password" required autoComplete="new-password" value={formData.password} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg ${formErrors.password ? 'border-red-500' : ''}`} placeholder="••••••••" />
                    </div>
                    {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                   </div>
                   <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></span>
                       <input type="password" name="confirmPassword" required autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 border rounded-lg ${formErrors.confirmPassword ? 'border-red-500' : ''}`} placeholder="••••••••" />
                    </div>
                    {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>}
                   </div>
                 </div>
              </div>

               {/* Role Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Select Your Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ROLES.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => setFormData({ ...formData, role: role.id, faculty: '', department: '', degreeProgram: '', semester: '', year: '', staffId: '', studentId: '', assignedLab: '', specialization: '' })}
                      className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none ${
                        formData.role === role.id
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 dark:bg-indigo-900/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <div className={`${formData.role === role.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                              {role.icon}
                            </div>
                            <span className={`block text-sm font-medium ${formData.role === role.id ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-slate-200'}`}>
                              {role.label}
                            </span>
                          </div>
                          <span className={`mt-2 block text-xs ${formData.role === role.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>
                            {role.desc}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                   className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register for UniSphere'}
                 </button>

                 <div className="relative">
                   <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                   </div>
                   <div className="relative flex justify-center text-sm">
                     <span className="px-2 bg-white dark:bg-slate-900 rounded text-slate-500">
                       Or continue with
                     </span>
                   </div>
                 </div>

                 <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {googleLoading ? 'Redirecting…' : 'Google'}
                </button>
              </div>

               <p className="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
                 Already have an account?{' '}
                 <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                   Sign in instead
                 </Link>
               </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
