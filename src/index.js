import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_PARAMS = {
  key: '43679088-c0d84692f93956b11d66778fa',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
};
let currentQuery = ''; // zadeklaruj zmienne
let currentPage = 1;

document.addEventListener('DOMContentLoaded', function () {
  const lightbox = new SimpleLightbox('.gallery a');
  document

    .getElementById('search-form')
    .addEventListener('submit', async function (event) {
      event.preventDefault();
      const query = document
        .querySelector('input[name="searchQuery"]')
        .value.trim();
      if (query !== '') {
        currentQuery = query;
        currentPage = 1;
        document.querySelector('.gallery').innerHTML = '';
        await searchImages(currentQuery, currentPage);
      }
    });

  document
    .querySelector('.load-more')
    .addEventListener('click', async function () {
      currentPage++;
      await searchImages(currentQuery, currentPage);
    });
});

async function searchImages(query, page) {
  const url = `https://pixabay.com/api/?key=${API_PARAMS.key}&q=${query}&image_type=${API_PARAMS.image_type}&orientation=${API_PARAMS.orientation}&safesearch=${API_PARAMS.safesearch}&page=${page}&per_page=40`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data.hits.length > 0) {
      if (page === 1) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
      data.hits.forEach(image => {
        const photoCard = `
          <div class="photo-card">
            <a href="${image.largeImageURL}" data-lightbox="image-${page}">
              <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            </a>
            <div class="info">
              <p class="info-item"><b>Likes:</b> ${image.likes}</p>
              <p class="info-item"><b>Views:</b> ${image.views}</p>
              <p class="info-item"><b>Comments:</b> ${image.comments}</p>
              <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
            </div>
          </div>
        `;
        document
          .querySelector('.gallery')
          .insertAdjacentHTML('beforeend', photoCard);
      });
      document.querySelector('.load-more').style.display = 'block';
      if (data.totalHits <= currentPage * 40) {
        document.querySelector('.load-more').style.display = 'none';
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }

      lightbox.refresh();

      smoothScroll();
    } else {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      document.querySelector('.load-more').style.display = 'none';
    }
  } catch (error) {
    Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
  }
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
