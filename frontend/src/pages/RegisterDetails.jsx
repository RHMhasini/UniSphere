import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { STUDENT_FACULTIES, LECTURER_FACULTIES, TECHNICIAN_DEPARTMENTS } from '../utils/dropdownData';
import { authAPI } from '../services/api';
import { Loader2, User, GraduationCap, Briefcase, Wrench, Phone, Building, BookOpen, Calendar, BadgeCheck, Camera } from 'lucide-react';

const RegisterDetails = () => {
  const { user, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [role, setRole] = useState('STUDENT');
  const [formData, setFormData] = useState({
    profilePictureUrl: '',
    firstName: '',
    lastName: '',
    phone: '',
    studentId: '',
    faculty: '',
    degreeProgram: '',
    year: '',
    semester: '',
    staffId: '',
    department: '',
    designation: '',
    specialization: '',
    assignedLab: ''
  });

  const validateField = (name, value, currentRole) => {
    let errorMsg = '';
    
    if (name === 'firstName' || name === 'lastName') {
      if (value && !/^[A-Za-z\s]+$/.test(value)) {
        errorMsg = 'Only letters and spaces are allowed';
      }
    }
    
    if (name === 'phone') {
      if (value && !/^\d*$/.test(value)) {
        errorMsg = 'Only numbers are allowed';
      } else if (value && value.length !== 10) {
        errorMsg = 'Phone number must be exactly 10 digits';
      }
    }
    
    if (name === 'studentId' && currentRole === 'STUDENT') {
      if (value && !/^STU\/\d{4}\/\d{3}$/.test(value)) {
        errorMsg = 'Format must be STU/YYYY/XXX (e.g. STU/2024/001)';
      }
    }
    
    if (name === 'staffId' && currentRole === 'LECTURER') {
      if (value && !/^LEC\/\d{4}$/.test(value)) {
        errorMsg = 'Format must be LEC/XXXX (e.g. LEC/0045)';
      }
    }
    
    if (name === 'staffId' && currentRole === 'TECHNICIAN') {
      if (value && !/^TEC\/\d{4}$/.test(value)) {
        errorMsg = 'Format must be TEC/XXXX (e.g. TEC/0012)';
      }
    }

    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent numbers and symbols in names
    if ((name === 'firstName' || name === 'lastName') && /[^A-Za-z\s]/.test(value)) {
      return;
    }

    // Prevent non-numeric characters and enforce max length 10 for phone
    if (name === 'phone') {
      if (/[^0-9]/.test(value)) return;
      if (value.length > 10) return;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Cascade clear logic
      if (name === 'faculty') {
        if (role === 'STUDENT') updated.degreeProgram = '';
        if (role === 'LECTURER') updated.department = '';
      }
      if (name === 'department' && role === 'TECHNICIAN') {
        updated.specialization = '';
        updated.assignedLab = '';
      }
      return updated;
    });

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    validateField(name, value, role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasErrors = 
         (formData.firstName && !/^[A-Za-z\s]+$/.test(formData.firstName)) ||
         (formData.lastName && !/^[A-Za-z\s]+$/.test(formData.lastName)) ||
         (formData.phone && !/^\d{10}$/.test(formData.phone)) ||
         (role === 'STUDENT' && formData.studentId && !/^STU\/\d{4}\/\d{3}$/.test(formData.studentId)) ||
         (role === 'LECTURER' && formData.staffId && !/^LEC\/\d{4}$/.test(formData.staffId)) ||
         (role === 'TECHNICIAN' && formData.staffId && !/^TEC\/\d{4}$/.test(formData.staffId));

    if (hasErrors) {
      setError('Please fix the errors in the form before submitting.');
      
      // Trigger all validations to show errors
      validateField('firstName', formData.firstName, role);
      validateField('lastName', formData.lastName, role);
      validateField('phone', formData.phone, role);
      if(role === 'STUDENT') validateField('studentId', formData.studentId, role);
      if(role === 'LECTURER' || role === 'TECHNICIAN') validateField('staffId', formData.staffId, role);
      
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: role,
        profilePictureUrl: formData.profilePictureUrl,
        ...(role === 'STUDENT' && {
          studentId: formData.studentId,
          faculty: formData.faculty,
          degreeProgram: formData.degreeProgram,
          year: formData.year,
          semester: formData.semester
        }),
        ...(role === 'LECTURER' && {
          staffId: formData.staffId,
          faculty: formData.faculty,
          department: formData.department,
          designation: formData.designation
        }),
        ...(role === 'TECHNICIAN' && {
          staffId: formData.staffId,
          department: formData.department,
          specialization: formData.specialization,
          assignedLab: formData.assignedLab
        })
      };

      await authAPI.submitAdditionalDetails(payload);
      await fetchCurrentUser();
      navigate('/register/pending');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper mesh-background min-h-screen py-12 px-4 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Complete Your Profile</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Please provide some additional details to complete your registration.</p>
        </div>

        <div className="card-premium p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { id: 'STUDENT', label: 'Student', icon: GraduationCap },
                { id: 'LECTURER', label: 'Lecturer', icon: Briefcase },
                { id: 'TECHNICIAN', label: 'Technician', icon: Wrench }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === item.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <item.icon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Profile Image Preview (Read-Only during registration) */}
            <div className="flex flex-col items-center justify-center pb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <img src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`} alt="Default" className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">Profile Photo</span>
              <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">(You can change this anytime from your profile)</span>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${fieldErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700/50 focus:ring-indigo-500/80'} bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm`}
                    placeholder="John"
                  />
                </div>
                {fieldErrors.firstName && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.firstName}</span>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${fieldErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700/50 focus:ring-indigo-500/80'} bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm`}
                    placeholder="Doe"
                  />
                </div>
                {fieldErrors.lastName && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.lastName}</span>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number (10 digits)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  name="phone"
                  required
                  type="text"
                  maxLength="10"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700/50 focus:ring-indigo-500/80'} bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm`}
                  placeholder="07X XXX XXXX"
                />
              </div>
              {fieldErrors.phone && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.phone}</span>}
            </div>

            {/* Role Specific Fields */}
            {role === 'STUDENT' && (
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Student ID</label>
                  <input
                    name="studentId"
                    required
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.studentId ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700/50 focus:ring-indigo-500/80'} bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm`}
                    placeholder="STU/YYYY/XXX"
                  />
                  {fieldErrors.studentId && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.studentId}</span>}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Faculty</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        name="faculty"
                        required
                        value={formData.faculty}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none"
                      >
                        <option value="" disabled>Select Faculty</option>
                        {Object.keys(STUDENT_FACULTIES).map((fac) => (
                          <option key={fac} value={fac}>{fac}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Degree Program</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        name="degreeProgram"
                        required
                        value={formData.degreeProgram}
                        onChange={handleChange}
                        disabled={!formData.faculty}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none disabled:opacity-50"
                      >
                        <option value="" disabled>Select Degree</option>
                        {formData.faculty && STUDENT_FACULTIES[formData.faculty]?.map((deg) => (
                          <option key={deg} value={deg}>{deg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        name="year"
                        required
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none"
                      >
                        <option value="" disabled>Select Year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        name="semester"
                        required
                        value={formData.semester}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none"
                      >
                        <option value="" disabled>Select Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === 'LECTURER' && (
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Staff ID</label>
                    <input
                      name="staffId"
                      required
                      value={formData.staffId}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.staffId ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700/50 focus:ring-indigo-500/80'} bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm`}
                      placeholder="LEC/XXXX"
                    />
                    {fieldErrors.staffId && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.staffId}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation</label>
                    <select
                      name="designation"
                      required
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none"
                    >
                      <option value="" disabled>Select Designation</option>
                      <option value="Instructor">Instructor</option>
                      <option value="Lecturer (Probationary)">Lecturer (Probationary)</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Senior Lecturer">Senior Lecturer</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                      <option value="Visiting Lecturer">Visiting Lecturer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Faculty</label>
                    <select
                      name="faculty"
                      required
                      value={formData.faculty}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none"
                    >
                      <option value="" disabled>Select Faculty</option>
                      {Object.keys(LECTURER_FACULTIES).map((fac) => (
                        <option key={fac} value={fac}>{fac}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!formData.faculty}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none disabled:opacity-50"
                    >
                      <option value="" disabled>Select Department</option>
                      {formData.faculty && LECTURER_FACULTIES[formData.faculty]?.map((dep) => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {role === 'TECHNICIAN' && (
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Staff ID</label>
                    <input
                      name="staffId"
                      required
                      value={formData.staffId}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.staffId ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700/50 focus:ring-indigo-500/80'} bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm`}
                      placeholder="TEC/XXXX"
                    />
                    {fieldErrors.staffId && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.staffId}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                    <select
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none"
                    >
                      <option value="" disabled>Select Department</option>
                      {Object.keys(TECHNICIAN_DEPARTMENTS).map((dep) => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialization</label>
                    <select
                      name="specialization"
                      required
                      value={formData.specialization}
                      onChange={handleChange}
                      disabled={!formData.department}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none disabled:opacity-50"
                    >
                      <option value="" disabled>Select Specialization</option>
                      {formData.department && TECHNICIAN_DEPARTMENTS[formData.department]?.specializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assigned Lab / Room</label>
                    <select
                      name="assignedLab"
                      required
                      value={formData.assignedLab}
                      onChange={handleChange}
                      disabled={!formData.department}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none disabled:opacity-50"
                    >
                      <option value="" disabled>Select Lab / Room</option>
                      {formData.department && TECHNICIAN_DEPARTMENTS[formData.department]?.labs.map((lab) => (
                        <option key={lab} value={lab}>{lab}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <BadgeCheck className="h-5 w-5" />
                  Submit for Approval
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterDetails;
