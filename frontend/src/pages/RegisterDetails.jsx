import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Loader2, User, GraduationCap, Briefcase, Wrench, Phone, Building, BookOpen, Calendar, BadgeCheck, Camera } from 'lucide-react';

const RegisterDetails = () => {
  const { user, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('STUDENT');
  const [formData, setFormData] = useState({
    profilePictureUrl: '',
    firstName: '',
    lastName: '',
    phone: '',
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm"
                    placeholder="John"
                  />
                </div>
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm"
                  placeholder="+94 7X XXX XXXX"
                />
              </div>
            </div>

            {/* Role Specific Fields */}
            {role === 'STUDENT' && (
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                        <option value="Computing">Computing</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Business">Business</option>
                        <option value="Science">Science</option>
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none"
                      >
                        <option value="" disabled>Select Degree</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Systems">Information Systems</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Business Management">Business Management</option>
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm"
                      placeholder="L-XXXX"
                    />
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
                      <option value="Computing">Computing</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business">Business</option>
                      <option value="Science">Science</option>
                    </select>
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
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Business Management">Business Management</option>
                      <option value="Data Science">Data Science</option>
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm"
                      placeholder="T-XXXX"
                    />
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
                      <option value="IT Support">IT Support</option>
                      <option value="Network Administration">Network Administration</option>
                      <option value="Hardware Maintenance">Hardware Maintenance</option>
                      <option value="Facility Management">Facility Management</option>
                      <option value="AV Systems">AV Systems</option>
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none"
                    >
                      <option value="" disabled>Select Specialization</option>
                      <option value="Cisco Networking">Cisco Networking</option>
                      <option value="System Administration">System Administration</option>
                      <option value="Hardware Repair">Hardware Repair</option>
                      <option value="Software Troubleshooting">Software Troubleshooting</option>
                      <option value="Audio/Visual Tech">Audio/Visual Tech</option>
                      <option value="General Maintenance">General Maintenance</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assigned Lab / Room</label>
                    <select
                      name="assignedLab"
                      required
                      value={formData.assignedLab}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500/80 outline-none transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm appearance-none"
                    >
                      <option value="" disabled>Select Lab / Room</option>
                      <option value="Cisco Lab">Cisco Lab</option>
                      <option value="Software Engineering Lab">Software Engineering Lab</option>
                      <option value="Hardware Lab">Hardware Lab</option>
                      <option value="Mac Lab">Mac Lab</option>
                      <option value="Main Auditorium">Main Auditorium</option>
                      <option value="Robotics Lab">Robotics Lab</option>
                      <option value="Data Science Lab">Data Science Lab</option>
                      <option value="General IT Store">General IT Store</option>
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
