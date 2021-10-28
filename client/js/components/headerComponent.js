function renderAuthenticatedHeader() {
    const header = document.querySelector('#header-nav');
    header.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#"><i class="fas fa-book-open"></i> Docufi</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" id="Home" >Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="Documents">Documents</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="Login">Login</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="Signup">Signup</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="Logout">Logout</a>
        </li>
      </ul>
      <form class="d-flex">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>
    `;

    // custom event handlers
    header.querySelectorAll('ul>li>a')?.forEach(element => {
        element.addEventListener('click', onHeaderSelected);
    });
}

function onHeaderSelected(e) {
    // remove active class from all headers
    document.querySelectorAll('ul>li>a')?.forEach(x => x.classList.remove('active'));
    // add active class to selected header
    e.target.classList.add('active');

    switch (e.target.id) {
        case "Home":
            renderHomePage();
            break;
        case "Documents":
            renderDocumentsPage();
            break;
        case "Login":
            renderLogin();
            break;
        case "Logout":
            logout();
            break
        case "Signup":
            renderSignup();
            break
        default:
            renderHomePage();
    }
}

