import React from 'react';
import { Link } from 'react-router-dom';

export default function FeedbackPage() {
  return (
    <>
      <div className="d-flex w-full h-screen">
        <h1>Hello!</h1>
        <Link to="/login">Login</Link>
      </div>
    </>
  );
}
