const viewButtons = document.querySelectorAll('[data-view-target]');
const navButtons = document.querySelectorAll('[data-nav]');
const views = document.querySelectorAll('.view');

const toast = document.getElementById('toast');
const fileInput = document.getElementById('file-input');
const uploadPreviews = document.getElementById('upload-previews');
const uploadEmpty = document.getElementById('upload-empty');
const submitBtn = document.getElementById('submit-btn');
const assignmentStatus = document.getElementById('assignment-status');
const homeStatus = document.getElementById('home-status');

function setView(target) {
  views.forEach((view) => {
    view.classList.toggle('is-active', view.dataset.view === target);
  });

  navButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.viewTarget === target);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

viewButtons.forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.viewTarget));
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function renderPreviews(files) {
  uploadPreviews.innerHTML = '';

  if (!files || files.length === 0) {
    uploadEmpty.style.display = 'block';
    return;
  }

  uploadEmpty.style.display = 'none';

  files.forEach((file) => {
    const item = document.createElement('div');
    item.className = 'upload-item';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;

    const label = document.createElement('span');
    label.textContent = file.name.length > 22 ? `${file.name.slice(0, 22)}…` : file.name;

    item.appendChild(img);
    item.appendChild(label);
    uploadPreviews.appendChild(item);
  });
}

if (fileInput) {
  fileInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files).slice(0, 6);
    renderPreviews(files);
  });
}

if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    if (assignmentStatus) {
      assignmentStatus.textContent = 'На проверке';
      assignmentStatus.classList.remove('status--new');
      assignmentStatus.classList.add('status--review');
    }

    if (homeStatus) {
      homeStatus.textContent = 'На проверке';
      homeStatus.classList.remove('status--new');
      homeStatus.classList.add('status--review');
    }

    showToast('Фото отправлены. Учитель проверит работу и пришлет разбор.');
  });
}

renderPreviews([]);
