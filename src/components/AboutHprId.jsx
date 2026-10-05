export default function AboutHprId({ onBackToForm }) {
  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow p-4">
        <h3 className="mb-3 text-primary">About HPR ID</h3>
        <p className="text-muted" style={{ lineHeight: '1.6' }}>
          The Healthcare Professional Registry (HPR) ID is a unique digital
          identification number assigned to registered healthcare professionals.
          It serves as a secure, unified identifier to streamline professional
          verification, streamline medical record management, and integrate
          healthcare workers into national digital health networks.
        </p>
        <button className="btn btn-secondary mt-3 w-100" onClick={onBackToForm}>
          Back to Form
        </button>
      </div>
    </div>
  );
}
