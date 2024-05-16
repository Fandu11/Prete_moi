import Navbar from "./components/Navbar.js";

function NotFoundPage() {
  return (
    <div className="App">
      {/* Navigation bar */}
      <Navbar />
      <div className="background-image">
        <div className="form-container">
          <p className="title1">Page inexistante</p>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
