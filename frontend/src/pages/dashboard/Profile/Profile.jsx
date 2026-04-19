import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/api';
import { Mail, Loader2, Pencil, User, Phone, Building, BookOpen, Calendar, Briefcase, Wrench, Camera, Save, X, GraduationCap } from 'lucide-react';
import { STUDENT_FACULTIES, LECTURER_FACULTIES, TECHNICIAN_DEPARTMENTS } from '../../../utils/dropdownData';

const roleBadgeClass = (role) => {
  const r = (role || '').toLowerCase();
  const map = {
    student: 'bg-sky-50 text-sky-800 ring-sky-600/15 dark:bg-sky-950/40 dark:text-sky-300',
    lecturer: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300',
    technician: 'bg-amber-50 text-amber-900 ring-amber-600/15 dark:bg-amber-950/40 dark:text-amber-200',
    admin: 'bg-indigo-50 text-indigo-800 ring-indigo-600/15 dark:bg-indigo-950/40 dark:text-indigo-300',
  };
  return (
    map[r] ||
    'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300'
  );
};

const Profile = () => {
  const { user, updateProfile, deleteAccount, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    studentId: '',
    profilePictureUrl: '',
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

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        studentId: user.studentId || '',
        profilePictureUrl: user.profilePictureUrl || '',
        faculty: user.faculty || '',
        degreeProgram: user.degreeProgram || '',
        year: user.year || '',
        semester: user.semester || '',
        staffId: user.staffId || '',
        department: user.department || '',
        designation: user.designation || '',
        specialization: user.specialization || '',
        assignedLab: user.assignedLab || ''
      });
    }
  }, [user]);

  const [fieldErrors, setFieldErrors] = useState({});

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
      if (value && !/^[A-Za-z]{2}[0-9]{8}$/.test(value)) {
        errorMsg = 'Invalid Student ID format (e.g. IT21000000)';
      }
    }
    
    if (name === 'staffId' && currentRole === 'LECTURER') {
      if (value && !/^Lec-\d{4}$/.test(value)) {
        errorMsg = 'Format must be Lec-XXXX (e.g. Lec-3456)';
      }
    }
    
    if (name === 'staffId' && currentRole === 'TECHNICIAN') {
      if (value && !/^Tec-\d{4}$/.test(value)) {
        errorMsg = 'Format must be Tec-XXXX (e.g. Tec-3456)';
      }
    }

    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone, prevent typing more than 10 chars, and only allow numbers
    if (name === 'phone') {
      if (value && !/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    // For names, prevent typing numbers or symbols (only allow letters and spaces)
    if (name === 'firstName' || name === 'lastName') {
      if (value && !/^[A-Za-z\s]*$/.test(value)) return;
    }
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Cascade clear logic
      const currentRole = user?.role;
      if (name === 'faculty') {
        if (currentRole === 'STUDENT') updated.degreeProgram = '';
        if (currentRole === 'LECTURER') updated.department = '';
      }
      if (name === 'department' && currentRole === 'TECHNICIAN') {
        updated.specialization = '';
        updated.assignedLab = '';
      }
      return updated;
    });

    validateField(name, value, user?.role);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImg(true);
      try {
        const res = await authAPI.uploadProfileImage(file);
        let uploadedUrl = res.data;
        if (typeof res.data === 'object' && res.data.data) {
          uploadedUrl = res.data.data;
        }
        setFormData((prev) => ({ ...prev, profilePictureUrl: uploadedUrl }));
        alert('Image uploaded! Click Save Changes to apply.');
      } catch (err) {
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploadingImg(false);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const role = user?.role;
    const hasErrors = 
         (formData.firstName && !/^[A-Za-z\s]+$/.test(formData.firstName)) ||
         (formData.lastName && !/^[A-Za-z\s]+$/.test(formData.lastName)) ||
         (formData.phone && !/^\d{10}$/.test(formData.phone)) ||
         (role === 'STUDENT' && formData.studentId && !/^[A-Za-z]{2}[0-9]{8}$/.test(formData.studentId)) ||
         (role === 'LECTURER' && formData.staffId && !/^Lec-\d{4}$/.test(formData.staffId)) ||
         (role === 'TECHNICIAN' && formData.staffId && !/^Tec-\d{4}$/.test(formData.staffId));

    if (hasErrors) {
      alert('Please fix the errors in the form before submitting.');
      
      // Trigger all validations to show errors
      validateField('firstName', formData.firstName, role);
      validateField('lastName', formData.lastName, role);
      validateField('phone', formData.phone, role);
      if(role === 'STUDENT') validateField('studentId', formData.studentId, role);
      if(role === 'LECTURER' || role === 'TECHNICIAN') validateField('staffId', formData.staffId, role);
      
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action is irreversible.'
      )
    ) {
      try {
        await deleteAccount();
        navigate('/login');
      } catch (error) {
        alert('Failed to delete account.');
      }
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            My profile
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your account details and preferences.
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-all"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
        {/* Profile Header Card */}
        <div className="card-premium overflow-hidden">
          <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:gap-10">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                {formData.profilePictureUrl ? (
                  <img
                    src={formData.profilePictureUrl}
                    alt=""
                    className="h-32 w-32 shrink-0 rounded-3xl object-cover ring-4 ring-indigo-50 dark:ring-indigo-900/30"
                  />
                ) : (
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl bg-indigo-100 text-4xl font-semibold text-indigo-700 ring-4 ring-indigo-50 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900/30">
                    {user.firstName?.charAt(0) || 'U'}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    {uploadingImg ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
                  </label>
                )}
              </div>
              {isEditing && (
                <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                  <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> Change Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
                </label>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user.fullName}
                </h2>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${roleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{user.phone || 'No phone added'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="card-premium space-y-6 p-8">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <User className="h-5 w-5 text-indigo-500" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">First Name</label>
                  {!isEditing ? (
                    <p className="text-slate-900 dark:text-slate-200">{formData.firstName}</p>
                  ) : (
                    <div>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-lg border ${fieldErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50 dark:bg-slate-950 text-sm`}
                      />
                      {fieldErrors.firstName && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.firstName}</span>}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Last Name</label>
                  {!isEditing ? (
                    <p className="text-slate-900 dark:text-slate-200">{formData.lastName}</p>
                  ) : (
                    <div>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-lg border ${fieldErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50 dark:bg-slate-950 text-sm`}
                      />
                      {fieldErrors.lastName && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.lastName}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Email (Read-only)</label>
                <p className="text-slate-500 dark:text-slate-400 italic">{user.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Phone</label>
                {!isEditing ? (
                  <p className="text-slate-900 dark:text-slate-200">{formData.phone}</p>
                ) : (
                  <div>
                    <input
                      name="phone"
                      type="text"
                      maxLength="10"
                      inputMode="numeric"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50 dark:bg-slate-950 text-sm`}
                    />
                    {fieldErrors.phone && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.phone}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic/Professional Information */}
          <div className="card-premium space-y-6 p-8">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              {user.role === 'STUDENT' ? (
                <><GraduationCap className="h-5 w-5 text-emerald-500" /> Academic Details</>
              ) : user.role === 'LECTURER' ? (
                <><Briefcase className="h-5 w-5 text-blue-500" /> Professional Details</>
              ) : (
                <><Wrench className="h-5 w-5 text-amber-500" /> Technical Details</>
              )}
            </h3>
            
            <div className="space-y-4">
              {user.role === 'STUDENT' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Faculty</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.faculty}</p>
                      ) : (
                        <select name="faculty" value={formData.faculty} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80">
                          <option value="" disabled>Select Faculty</option>
                          {Object.keys(STUDENT_FACULTIES).map((fac) => (
                            <option key={fac} value={fac}>{fac}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Degree</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.degreeProgram}</p>
                      ) : (
                        <select name="degreeProgram" value={formData.degreeProgram} onChange={handleChange} disabled={!formData.faculty} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80 disabled:opacity-50">
                          <option value="" disabled>Select Degree</option>
                          {formData.faculty && STUDENT_FACULTIES[formData.faculty]?.map((deg) => (
                            <option key={deg} value={deg}>{deg}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Year</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.year}</p>
                      ) : (
                        <select name="year" value={formData.year} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80">
                          <option value="" disabled>Select Year</option>
                          {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((yr) => (
                            <option key={yr} value={yr}>{yr}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Semester</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.semester}</p>
                      ) : (
                        <select name="semester" value={formData.semester} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80">
                          <option value="" disabled>Select Semester</option>
                          {['Semester 1', 'Semester 2'].map((sem) => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </>
              )}

              {user.role === 'LECTURER' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Staff ID</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.staffId}</p>
                      ) : (
                        <div>
                          <input name="staffId" value={formData.staffId} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${fieldErrors.staffId ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50 dark:bg-slate-950 text-sm`} />
                          {fieldErrors.staffId && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.staffId}</span>}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Designation</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.designation}</p>
                      ) : (
                        <select name="designation" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80">
                          <option value="" disabled>Select Position</option>
                          {['Lecturer', 'Senior Lecturer', 'Professor', 'Assistant Professor', 'Visiting Lecturer'].map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Faculty</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.faculty}</p>
                      ) : (
                        <select name="faculty" value={formData.faculty} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80">
                          <option value="" disabled>Select Faculty</option>
                          {Object.keys(LECTURER_FACULTIES).map((fac) => (
                            <option key={fac} value={fac}>{fac}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Department</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.department}</p>
                      ) : (
                        <select name="department" value={formData.department} onChange={handleChange} disabled={!formData.faculty} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80 disabled:opacity-50">
                          <option value="" disabled>Select Department</option>
                          {formData.faculty && LECTURER_FACULTIES[formData.faculty]?.map((dep) => (
                            <option key={dep} value={dep}>{dep}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </>
              )}

              {user.role === 'TECHNICIAN' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Staff ID</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.staffId}</p>
                      ) : (
                        <div>
                          <input name="staffId" value={formData.staffId} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${fieldErrors.staffId ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50 dark:bg-slate-950 text-sm`} />
                          {fieldErrors.staffId && <span className="text-xs text-red-500 mt-1 block">{fieldErrors.staffId}</span>}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Designation</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.designation}</p>
                      ) : (
                        <select name="designation" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80">
                          <option value="" disabled>Select Position</option>
                          {['Senior Technician', 'Lab Assistant', 'System Administrator', 'Network Engineer', 'Maintenance Staff'].map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Department</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.department}</p>
                      ) : (
                        <select name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80">
                          <option value="" disabled>Select Department</option>
                          {Object.keys(TECHNICIAN_DEPARTMENTS).map((dep) => (
                            <option key={dep} value={dep}>{dep}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Specialization</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.specialization}</p>
                      ) : (
                        <select name="specialization" value={formData.specialization} onChange={handleChange} disabled={!formData.department} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80 disabled:opacity-50">
                          <option value="" disabled>Select Specialization</option>
                          {formData.department && TECHNICIAN_DEPARTMENTS[formData.department]?.specializations.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Assigned Lab</label>
                      {!isEditing ? (
                        <p className="text-slate-900 dark:text-slate-200">{formData.assignedLab}</p>
                      ) : (
                        <select name="assignedLab" value={formData.assignedLab} onChange={handleChange} disabled={!formData.department} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm active:outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500/80 disabled:opacity-50">
                          <option value="" disabled>Select Lab / Room</option>
                          {formData.department && TECHNICIAN_DEPARTMENTS[formData.department]?.labs.map((lab) => (
                            <option key={lab} value={lab}>{lab}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={loading || uploadingImg}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all disabled:opacity-70 dark:shadow-none"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Changes
            </button>
          </div>
        )}

        {!isEditing && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="rounded-2xl bg-red-50 p-6 dark:bg-red-950/20">
              <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Danger Zone</h4>
              <p className="mt-1 text-xs text-red-600 dark:text-red-500/80">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                className="mt-4 text-xs font-bold text-red-700 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete my account permanently
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
