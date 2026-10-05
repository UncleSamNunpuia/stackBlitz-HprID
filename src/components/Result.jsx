import { useState } from 'react';
import AboutHprId from './AboutHprId';

export default function Result() {
  const [showAbout, setShowAbout] = useState(false);

  // If the user clicked the clickable component, render AboutHprId instead
  if (showAbout) {
    return <AboutHprId onBackToForm={() => setShowAbout(false)} />;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <div className="card shadow p-5 text-center bg-light">
        <div className="mb-3">
          <span className="text-success" style={{ fontSize: '3rem' }}>
            ✔
          </span>
        </div>
        <h2 className="text-success mb-3">Success!</h2>
        <p className="lead text-muted">
          Data sent successfully to the database.
        </p>

        {/* Clickable component/link to view info about HPR ID */}
        <div className="my-3">
          <span
            className="text-primary text-decoration-underline"
            style={{ cursor: 'pointer', fontWeight: '500' }}
            onClick={() => setShowAbout(true)}
          >
            What is HPR ID? (Click to learn more)
          </span>
        </div>

        <button
          className="btn btn-primary mt-3"
          onClick={() => window.location.reload()} // Resets back to the form page
        >
          Back to Form
        </button>
      </div>
    </div>
  );
}
// export default function Result() {
//   return (
//     <div className="container mt-5" style={{ maxWidth: '500px' }}>
//       <div className="card shadow p-5 text-center bg-light">
//         <div className="mb-3">
//           <span className="text-success" style={{ fontSize: '3rem' }}>
//             ✔
//           </span>
//         </div>
//         <h2 className="text-success mb-3">Success!</h2>
//         <p className="lead text-muted">
//           Data sent successfully to the database.
//         </p>
//         <button
//           className="btn btn-primary mt-3"
//           onClick={() => window.location.reload()} // Resets back to the form
//         >
//           Back to Form
//         </button>
//       </div>
//     </div>
//   );
// }
