import { useState, useEffect } from 'react';
import supabase from '../config/SupabaseClient';
// import supabase from '../config/supabaseClient'; // Adjust the import path to your Supabase client file
import Result from './Result'; // Import the Result component
import AboutHprId from './AboutHprId';

export default function HprInput() {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    department: '',
    phoneNo: '',
    hprId: '',
  });

  const [dbRecords, setDbRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const [dbStatus, setDbStatus] = useState('Connecting...');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function fetchAllRecords() {
      try {
        const { data, error } = await supabase.from('hpr-table').select('*');

        if (error) {
          console.error('Supabase error:', error.message);
          setDbStatus(`Connection Failed: ${error.message}`);
        } else {
          setDbStatus('Connected successfully!');
          if (data) {
            setDbRecords(data);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setDbStatus('Connection Failed: Unexpected error');
      } finally {
        setLoadingRecords(false);
      }
    }

    fetchAllRecords();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'name') {
        const matchedRecord = dbRecords.find(
          (record) =>
            record.name && record.name.toLowerCase() === value.toLowerCase()
        );

        if (matchedRecord) {
          updated.designation = matchedRecord.designation || '';
          updated.email = matchedRecord.email || '';
          updated.department = matchedRecord.department || '';
          updated.phoneNo = matchedRecord.phone_no || '';
          updated.hprId = matchedRecord.hpr_id || '';
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    // Helper to generate current timestamp in IST with +05:30 offset
    const getISTTimestamp = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      const getPart = (type) => parts.find((p) => p.type === type)?.value;

      return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}:${getPart('second')}+05:30`;
    };

    // Explicitly attach current ISO timestamp so ONLY this row updates its time
    const payload = {
      name: formData.name,
      designation: formData.designation,
      email: formData.email,
      department: formData.department,
      phone_no: formData.phoneNo,
      hpr_id: formData.hprId,
      updated_at: getISTTimestamp(), // 👈 Uses the IST timestamp generator
      // updated_at: new Date().toISOString(), // 👈 Sets exact timestamp for this specific row only
    };

    console.log('Data to be sent/updated in database:', payload);

    try {
      const existingRecord = dbRecords.find(
        (r) => r.name && r.name.toLowerCase() === formData.name.toLowerCase()
      );

      let error;
      if (existingRecord) {
        // Update only the specific row matching the ID
        const { error: updateError } = await supabase
          .from('hpr-table')
          .update(payload)
          .eq('id', existingRecord.id);
        error = updateError;
      } else {
        // Insert brand new record with its own fresh timestamp
        const { error: insertError } = await supabase
          .from('hpr-table')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      setIsSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err.message);
      setMessage({ text: `Error: ${err.message}`, type: 'danger' });
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <Result />;
  }

  const uniqueNames = [
    ...new Set(dbRecords.map((item) => item.name).filter(Boolean)),
  ];

  return (
    <div className="container mt-5 mb-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow p-4">
        <h2 className="mb-4 text-center">HPR User Registration & Update</h2>

        <div
          className={`alert py-2 mb-4 ${
            dbStatus.includes('Connected successfully')
              ? 'alert-success'
              : dbStatus.includes('Failed')
              ? 'alert-danger'
              : 'alert-warning'
          }`}
          role="alert"
          style={{ fontSize: '0.9rem' }}
        >
          <strong>DB Status:</strong> {dbStatus}
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`} role="alert">
            {message.text}
          </div>
        )}
        <div className="px-3 border border-green mx-auto bg-info-subtle">
          Fill out the form plsx
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-bold">
              Name:
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              list="name-list"
              placeholder={
                loadingRecords
                  ? 'Loading names from DB...'
                  : 'Type or select name...'
              }
              value={formData.name}
              onChange={handleChange}
              required
            />
            <datalist id="name-list">
              {uniqueNames.map((nameOpt, index) => (
                <option key={index} value={nameOpt} />
              ))}
            </datalist>
          </div>

          <div className="mb-3">
            <label htmlFor="designation" className="form-label fw-bold">
              Designation:
            </label>
            <input
              type="text"
              className="form-control"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-bold">
              Email:
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="department" className="form-label fw-bold">
              Department:
            </label>
            <input
              type="text"
              className="form-control"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="phoneNo" className="form-label fw-bold">
              Phone No:
            </label>
            <input
              type="tel"
              className="form-control"
              id="phoneNo"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="hprId" className="form-label fw-bold">
              HPR ID:
            </label>
            <input
              type="text"
              className="form-control"
              id="hprId"
              name="hprId"
              placeholder="Enter HPR ID..."
              value={formData.hprId}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Submit & Update DB'}
          </button>
        </form>
      </div>
    </div>
  );
}

// export default function HprInput() {
//   // Form input state
//   const [formData, setFormData] = useState({
//     name: '',
//     designation: '',
//     email: '',
//     department: '',
//     phoneNo: '',
//     hprId: '',
//   });

//   // Store all fetched user records from the database
//   const [dbRecords, setDbRecords] = useState([]);
//   const [loadingRecords, setLoadingRecords] = useState(true);

//   // UI & Routing view state
//   const [dbStatus, setDbStatus] = useState('Connecting...');
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });
//   const [isSubmitted, setIsSubmitted] = useState(false); // Controls view switching

//   // 1. Fetch all records from 'hpr-table' on component mount
//   useEffect(() => {
//     async function fetchAllRecords() {
//       try {
//         const { data, error } = await supabase.from('hpr-table').select('*');

//         if (error) {
//           console.error('Supabase error:', error.message);
//           setDbStatus(`Connection Failed: ${error.message}`);
//         } else {
//           setDbStatus('Connected successfully!');
//           if (data) {
//             setDbRecords(data);
//           }
//         }
//       } catch (err) {
//         console.error('Unexpected error:', err);
//         setDbStatus('Connection Failed: Unexpected error');
//       } finally {
//         setLoadingRecords(false);
//       }
//     }

//     fetchAllRecords();
//   }, []);

//   // Handle form input changes and auto-fill if Name matches an existing record
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => {
//       const updated = { ...prev, [name]: value };

//       if (name === 'name') {
//         const matchedRecord = dbRecords.find(
//           (record) =>
//             record.name && record.name.toLowerCase() === value.toLowerCase()
//         );

//         if (matchedRecord) {
//           updated.designation = matchedRecord.designation || '';
//           updated.email = matchedRecord.email || '';
//           updated.department = matchedRecord.department || '';
//           updated.phoneNo = matchedRecord.phone_no || '';
//           updated.hprId = matchedRecord.hpr_id || '';
//         }
//       }

//       return updated;
//     });
//   };

//   // Handle form submission: update database and switch view
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setMessage({ text: '', type: '' });

//     const payload = {
//       name: formData.name,
//       designation: formData.designation,
//       email: formData.email,
//       department: formData.department,
//       phone_no: formData.phoneNo,
//       hpr_id: formData.hprId,
//     };

//     console.log('Data to be sent/updated in database:', payload);

//     try {
//       const existingRecord = dbRecords.find(
//         (r) => r.name && r.name.toLowerCase() === formData.name.toLowerCase()
//       );

//       let error;
//       if (existingRecord) {
//         const { error: updateError } = await supabase
//           .from('hpr-table')
//           .update(payload)
//           .eq('id', existingRecord.id);
//         error = updateError;
//       } else {
//         const { error: insertError } = await supabase
//           .from('hpr-table')
//           .insert([payload]);
//         error = insertError;
//       }

//       if (error) throw error;

//       // SUCCESS: Switch view to Result component
//       setIsSubmitted(true);
//     } catch (err) {
//       console.error('Submission error:', err.message);
//       setMessage({ text: `Error: ${err.message}`, type: 'danger' });
//       setSubmitting(false);
//     }
//   };

//   // If successfully submitted, render the Result component instead of the form
//   if (isSubmitted) {
//     return <Result />;
//   }

//   const uniqueNames = [
//     ...new Set(dbRecords.map((item) => item.name).filter(Boolean)),
//   ];

//   return (
//     <div className="container mt-5 mb-5" style={{ maxWidth: '600px' }}>
//       <div className="card shadow p-4">
//         <h2 className="mb-4 text-center">HPR User Registration & Update</h2>

//         {/* Database Connection Status Banner */}
//         <div
//           className={`alert py-2 mb-4 ${
//             dbStatus.includes('Connected successfully')
//               ? 'alert-success'
//               : dbStatus.includes('Failed')
//               ? 'alert-danger'
//               : 'alert-warning'
//           }`}
//           role="alert"
//           style={{ fontSize: '0.9rem' }}
//         >
//           <strong>DB Status:</strong> {dbStatus}
//         </div>

//         {/* Success/Error Feedback Message */}
//         {message.text && (
//           <div className={`alert alert-${message.type}`} role="alert">
//             {message.text}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           {/* Name Combobox with Database Suggestions */}
//           <div className="mb-3">
//             <label htmlFor="name" className="form-label fw-bold">
//               Name:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="name"
//               name="name"
//               list="name-list"
//               placeholder={
//                 loadingRecords
//                   ? 'Loading names from DB...'
//                   : 'Type or select name...'
//               }
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//             <datalist id="name-list">
//               {uniqueNames.map((nameOpt, index) => (
//                 <option key={index} value={nameOpt} />
//               ))}
//             </datalist>
//           </div>

//           {/* Designation */}
//           <div className="mb-3">
//             <label htmlFor="designation" className="form-label fw-bold">
//               Designation:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="designation"
//               name="designation"
//               placeholder="Auto-filled from record"
//               value={formData.designation}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Email */}
//           <div className="mb-3">
//             <label htmlFor="email" className="form-label fw-bold">
//               Email:
//             </label>
//             <input
//               type="email"
//               className="form-control"
//               id="email"
//               name="email"
//               placeholder="Auto-filled from record"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Department */}
//           <div className="mb-3">
//             <label htmlFor="department" className="form-label fw-bold">
//               Department:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="department"
//               name="department"
//               placeholder="Auto-filled from record"
//               value={formData.department}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Phone No */}
//           <div className="mb-3">
//             <label htmlFor="phoneNo" className="form-label fw-bold">
//               Phone No:
//             </label>
//             <input
//               type="tel"
//               className="form-control"
//               id="phoneNo"
//               name="phoneNo"
//               placeholder="Auto-filled from record"
//               value={formData.phoneNo}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* HPR ID */}
//           <div className="mb-4">
//             <label htmlFor="hprId" className="form-label fw-bold">
//               HPR ID:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="hprId"
//               name="hprId"
//               placeholder="Enter HPR ID..."
//               value={formData.hprId}
//               onChange={handleChange}
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="btn btn-primary w-100 py-2"
//             disabled={submitting}
//           >
//             {submitting ? 'Processing...' : 'Submit & Update DB'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default function HprInput() {
//   // Form input state
//   const [formData, setFormData] = useState({
//     name: '',
//     designation: '',
//     email: '',
//     department: '',
//     phoneNo: '',
//     hprId: '',
//   });

//   // Store all fetched user records from the database
//   const [dbRecords, setDbRecords] = useState([]);
//   const [loadingRecords, setLoadingRecords] = useState(true);

//   // UI feedback states
//   const [dbStatus, setDbStatus] = useState('Connecting...');
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });

//   // 1. Fetch all records from 'hpr-table' on component mount
//   useEffect(() => {
//     async function fetchAllRecords() {
//       try {
//         const { data, error } = await supabase.from('hpr-table').select('*');

//         if (error) {
//           console.error('Supabase error:', error.message);
//           setDbStatus(`Connection Failed: ${error.message}`);
//         } else {
//           setDbStatus('Connected successfully!');
//           console.log('Fetched all records from hpr-table:', data);
//           if (data) {
//             setDbRecords(data);
//           }
//         }
//       } catch (err) {
//         console.error('Unexpected error:', err);
//         setDbStatus('Connection Failed: Unexpected error');
//       } finally {
//         setLoadingRecords(false);
//       }
//     }

//     fetchAllRecords();
//   }, []);

//   // Handle form input changes and auto-fill if Name matches an existing record
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => {
//       const updated = { ...prev, [name]: value };

//       // If the user is typing/selecting the 'name', check if it matches an existing record from DB
//       if (name === 'name') {
//         const matchedRecord = dbRecords.find(
//           (record) =>
//             record.name && record.name.toLowerCase() === value.toLowerCase()
//         );

//         if (matchedRecord) {
//           // Auto-fill the rest of the fields from the database record
//           updated.designation = matchedRecord.designation || '';
//           updated.email = matchedRecord.email || '';
//           updated.department = matchedRecord.department || '';
//           updated.phoneNo = matchedRecord.phone_no || '';
//           updated.hprId = matchedRecord.hpr_id || ''; // Pre-fill if it exists, user can overwrite/enter it
//         }
//       }

//       return updated;
//     });
//   };

//   // Handle form submission: Console log values & update database
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setMessage({ text: '', type: '' });

//     // Payload to be sent/updated in the database
//     const payload = {
//       name: formData.name,
//       designation: formData.designation,
//       email: formData.email,
//       department: formData.department,
//       phone_no: formData.phoneNo,
//       hpr_id: formData.hprId, // user-entered HPR ID (can be null/string)
//     };

//     // Console log the values to be sent to the database as requested
//     console.log('Data to be sent/updated in database:', payload);

//     try {
//       // Check if user already exists by name to decide whether to update or insert
//       const existingRecord = dbRecords.find(
//         (r) => r.name && r.name.toLowerCase() === formData.name.toLowerCase()
//       );

//       let error;
//       if (existingRecord) {
//         // Update existing record with the new HPR ID (and any changed fields)
//         const { error: updateError } = await supabase
//           .from('hpr-table')
//           .update(payload)
//           .eq('id', existingRecord.id);
//         error = updateError;
//       } else {
//         // Insert new record if name doesn't exist
//         const { error: insertError } = await supabase
//           .from('hpr-table')
//           .insert([payload]);
//         error = insertError;
//       }

//       if (error) throw error;

//       setMessage({
//         text: 'Data successfully processed and sent to Supabase!',
//         type: 'success',
//       });
//     } catch (err) {
//       console.error('Submission error:', err.message);
//       setMessage({ text: `Error: ${err.message}`, type: 'danger' });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Extract unique names for the name suggestion datalist
//   const uniqueNames = [
//     ...new Set(dbRecords.map((item) => item.name).filter(Boolean)),
//   ];

//   return (
//     <div className="container mt-5 mb-5" style={{ maxWidth: '600px' }}>
//       <div className="card shadow p-4">
//         <h2 className="mb-4 text-center">HPR User Registration & Update</h2>

//         {/* Database Connection Status Banner */}
//         <div
//           className={`alert py-2 mb-4 ${
//             dbStatus.includes('Connected successfully')
//               ? 'alert-success'
//               : dbStatus.includes('Failed')
//               ? 'alert-danger'
//               : 'alert-warning'
//           }`}
//           role="alert"
//           style={{ fontSize: '0.9rem' }}
//         >
//           <strong>DB Status:</strong> {dbStatus}
//         </div>

//         {/* Success/Error Feedback Message */}
//         {message.text && (
//           <div className={`alert alert-${message.type}`} role="alert">
//             {message.text}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           {/* Name Combobox with Database Suggestions */}
//           <div className="mb-3">
//             <label htmlFor="name" className="form-label fw-bold">
//               Name:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="name"
//               name="name"
//               list="name-list"
//               placeholder={
//                 loadingRecords
//                   ? 'Loading names from DB...'
//                   : 'Type or select name (e.g. sam)...'
//               }
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//             <datalist id="name-list">
//               {uniqueNames.map((nameOpt, index) => (
//                 <option key={index} value={nameOpt} />
//               ))}
//             </datalist>
//           </div>

//           {/* Designation (Auto-filled / editable) */}
//           <div className="mb-3">
//             <label htmlFor="designation" className="form-label fw-bold">
//               Designation:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="designation"
//               name="designation"
//               placeholder="Auto-filled from record"
//               value={formData.designation}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Email (Auto-filled / editable) */}
//           <div className="mb-3">
//             <label htmlFor="email" className="form-label fw-bold">
//               Email:
//             </label>
//             <input
//               type="email"
//               className="form-control"
//               id="email"
//               name="email"
//               placeholder="Auto-filled from record"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Department (Auto-filled / editable) */}
//           <div className="mb-3">
//             <label htmlFor="department" className="form-label fw-bold">
//               Department:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="department"
//               name="department"
//               placeholder="Auto-filled from record"
//               value={formData.department}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Phone No (Auto-filled / editable) */}
//           <div className="mb-3">
//             <label htmlFor="phoneNo" className="form-label fw-bold">
//               Phone No:
//             </label>
//             <input
//               type="tel"
//               className="form-control"
//               id="phoneNo"
//               name="phoneNo"
//               placeholder="Auto-filled from record"
//               value={formData.phoneNo}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* HPR ID (User enters this) */}
//           <div className="mb-4">
//             <label htmlFor="hprId" className="form-label fw-bold">
//               HPR ID:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="hprId"
//               name="hprId"
//               placeholder="Enter HPR ID..."
//               value={formData.hprId}
//               onChange={handleChange}
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="btn btn-primary w-100 py-2"
//             disabled={submitting}
//           >
//             {submitting ? 'Processing...' : 'Submit & Update DB'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from 'react';
// import supabase from '../config/SupabaseClient';
// // import supabase from '../config/supabaseClient'; // Adjust the import path to your Supabase client file

// export default function HprInput() {
//   // Form input state
//   const [formData, setFormData] = useState({
//     name: '',
//     designation: '',
//     email: '',
//     department: '',
//     phoneNo: '',
//     hprId: '',
//   });

//   // State for designation combobox options fetched from DB
//   const [designations, setDesignations] = useState([]);
//   const [loadingDesignations, setLoadingDesignations] = useState(true);

//   // UI feedback states
//   const [dbStatus, setDbStatus] = useState('Connecting...');
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });

//   // 1. Check Supabase connection & Fetch existing unique designations on mount
//   useEffect(() => {
//     async function initData() {
//       try {
//         const { data, error } = await supabase
//           .from('hpr-table')
//           .select('designation');

//         if (error) {
//           console.error('Supabase error:', error.message);
//           setDbStatus(`Connection Failed: ${error.message}`);
//         } else {
//           setDbStatus('Connected successfully!');
//           // Extract unique designations to populate combobox dynamically
//           if (data && data.length > 0) {
//             const uniqueDesignations = [
//               ...new Set(data.map((item) => item.designation).filter(Boolean)),
//             ];
//             setDesignations(uniqueDesignations);
//           }
//         }
//       } catch (err) {
//         console.error('Unexpected error:', err);
//         setDbStatus('Connection Failed: Unexpected error');
//       } finally {
//         setLoadingDesignations(false);
//       }
//     }

//     initData();
//   }, []);

//   // Handle form input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Handle form submission to Supabase `hpr_table`
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setMessage({ text: '', type: '' });

//     try {
//       const { error } = await supabase.from('hpr_table').insert([
//         {
//           name: formData.name,
//           designation: formData.designation,
//           department: formData.department,
//           email: formData.email,
//           hpr_id: formData.hprId, // Ensure this matches your Supabase column name
//           phone_no: formData.phoneNo, // Ensure this matches your Supabase column name
//         },
//       ]);

//       if (error) {
//         throw error;
//       }

//       setMessage({
//         text: 'Data successfully submitted to Supabase!',
//         type: 'success',
//       });

//       // Dynamically append new custom designation to local state list if it's unique
//       if (
//         formData.designation &&
//         !designations.includes(formData.designation)
//       ) {
//         setDesignations((prev) => [...prev, formData.designation]);
//       }

//       // Reset form fields
//       setFormData({
//         name: '',
//         designation: '',
//         email: '',
//         department: '',
//         phoneNo: '',
//         hprId: '',
//       });
//     } catch (err) {
//       console.error('Submission error:', err.message);
//       setMessage({
//         text: `Error submitting form: ${err.message}`,
//         type: 'danger',
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="container mt-5 mb-5" style={{ maxWidth: '600px' }}>
//       <div className="card shadow p-4">
//         <h2 className="mb-4 text-center">HPR User Registration Form</h2>

//         {/* Database Connection Status Banner */}
//         <div
//           className={`alert py-2 mb-4 ${
//             dbStatus.includes('Connected successfully')
//               ? 'alert-success'
//               : dbStatus.includes('Failed')
//               ? 'alert-danger'
//               : 'alert-warning'
//           }`}
//           role="alert"
//           style={{ fontSize: '0.9rem' }}
//         >
//           <strong>DB Status:</strong> {dbStatus}
//         </div>

//         {/* Success/Error Feedback Message */}
//         {message.text && (
//           <div className={`alert alert-${message.type}`} role="alert">
//             {message.text}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           {/* Name */}
//           <div className="mb-3">
//             <label htmlFor="name" className="form-label fw-bold">
//               Name:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="name"
//               name="name"
//               placeholder="Enter full name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Designation Combobox */}
//           <div className="mb-3">
//             <label htmlFor="designation" className="form-label fw-bold">
//               Designation:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="designation"
//               name="designation"
//               list="designation-list"
//               placeholder={
//                 loadingDesignations
//                   ? 'Loading designations...'
//                   : 'Select or type custom designation...'
//               }
//               value={formData.designation}
//               onChange={handleChange}
//               required
//             />
//             <datalist id="designation-list">
//               {designations.map((item, index) => (
//                 <option key={index} value={item} />
//               ))}
//             </datalist>
//           </div>

//           {/* Email */}
//           <div className="mb-3">
//             <label htmlFor="email" className="form-label fw-bold">
//               Email:
//             </label>
//             <input
//               type="email"
//               className="form-control"
//               id="email"
//               name="email"
//               placeholder="Enter email address"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Department */}
//           <div className="mb-3">
//             <label htmlFor="department" className="form-label fw-bold">
//               Department:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="department"
//               name="department"
//               placeholder="Enter department"
//               value={formData.department}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Phone No */}
//           <div className="mb-3">
//             <label htmlFor="phoneNo" className="form-label fw-bold">
//               Phone No:
//             </label>
//             <input
//               type="tel"
//               className="form-control"
//               id="phoneNo"
//               name="phoneNo"
//               placeholder="Enter phone number"
//               value={formData.phoneNo}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* HPR ID */}
//           <div className="mb-4">
//             <label htmlFor="hprId" className="form-label fw-bold">
//               HPR ID:
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="hprId"
//               name="hprId"
//               placeholder="Enter HPR ID"
//               value={formData.hprId}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="btn btn-primary w-100 py-2"
//             disabled={submitting}
//           >
//             {submitting ? 'Submitting...' : 'Submit Form'}
//           </button>
//         </form>
//         <div>{designations}</div>
//       </div>
//     </div>
//   );
// }
