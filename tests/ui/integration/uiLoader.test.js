/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('uiLoader.js', () => {
  let fetchMock;
  let content;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="content"></div>
      <nav class="sidebar">
        <a data-page="home" href="#">Home</a>
        <a data-page="projects" href="#">Projects</a>
      </nav>
    `;

    content = document.getElementById('content');

    // Simula fetch dinamico della vista
    fetchMock = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('<div class="test-view">Hello View<div class="wrapper notifications"></div></div>')
      })
    );
    global.fetch = fetchMock;

    // Mock electronAPI globale
    global.window.electronAPI = {
      getGlobalState: jest.fn(() => Promise.resolve({ id: 123 })),
    };

    // Mock delle funzioni UI globali
    global.updateFormattedDate = jest.fn();
    global.initializeDatePicker = jest.fn();
    global.populateProjectSelector = jest.fn();
    global.initializeTimeTracking = jest.fn();
    global.setupToggleTimerMode = jest.fn();
    global.clearPreviousDaysEntriesPrevious = jest.fn();
    global.loadTimeEntriesMain = jest.fn();
    global.deleteSelectedEntriesMain = jest.fn();
    global.loadPreviousDaysEntriesPrevious = jest.fn();

    global.initializeActivityView = jest.fn();
    global.loadActivityData = jest.fn();
    global.initializeTagsView = jest.fn();
    global.loadTagsData = jest.fn();
    global.initializeProjectsView = jest.fn();
    global.loadProjectsData = jest.fn();
    global.initializeTimeSheetView = jest.fn();
    global.initializeReportsView = jest.fn();
    global.initializeAlertsView = jest.fn();
  });

  test('carica correttamente una vista e inserisce HTML nel #content', async () => {
    await import('../renderer/ui/uiLoader.js');
    expect(fetchMock).toHaveBeenCalledWith('views/home.html');
    expect(content.innerHTML).toContain('Hello View');
    expect(content.querySelector('.wrapper.notifications')).toBeInTheDocument();
  });

  test('blocca caricamento multiplo con isLoadingView', async () => {
    let resolveFetch;
    fetchMock.mockImplementation(() =>
      new Promise((resolve) => {
        resolveFetch = () => resolve({
          ok: true,
          text: () => Promise.resolve('<div class="wrapper notifications"></div>')
        });
      })
    );

    import('../renderer/ui/uiLoader.js');
    fireEvent.click(document.querySelectorAll('.sidebar a')[0]);
    fireEvent.click(document.querySelectorAll('.sidebar a')[1]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFetch(); // Sblocca fetch simulata
  });

  test('evita doppio caricamento script se già presente', async () => {
    const src = '../renderer/ui/uiHome.js';
    const script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);

    await import('../renderer/ui/uiLoader.js');
    expect(document.querySelectorAll(`script[src="${src}"]`).length).toBe(1);
  });

  test('chiama electronAPI.getGlobalState durante il load della home', async () => {
    await import('../renderer/ui/uiLoader.js');
    expect(global.window.electronAPI.getGlobalState).toHaveBeenCalled();
  });

  test('chiama le funzioni di inizializzazione Home correttamente', async () => {
    await import('../renderer/ui/uiLoader.js');

    expect(updateFormattedDate).toHaveBeenCalled();
    expect(initializeDatePicker).toHaveBeenCalled();
    expect(populateProjectSelector).toHaveBeenCalled();
    expect(initializeTimeTracking).toHaveBeenCalled();
    expect(setupToggleTimerMode).toHaveBeenCalled();
    expect(clearPreviousDaysEntriesPrevious).toHaveBeenCalled();
  });

  test('inizializza Activity view correttamente', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('<div class="wrapper notifications"></div>') })
    );
    document.querySelectorAll('.sidebar a')[0].dataset.page = 'activity';

    await import('../renderer/ui/uiLoader.js');
    fireEvent.click(document.querySelectorAll('.sidebar a')[0]);

    expect(initializeActivityView).toHaveBeenCalled();
    expect(loadActivityData).toHaveBeenCalled();
  });

  test('inizializza Projects, Tags, TimeSheet, Reports e Alerts', async () => {
    const pages = [
      { page: 'tags', fn: initializeTagsView },
      { page: 'projects', fn: initializeProjectsView },
      { page: 'timeSheet', fn: initializeTimeSheetView },
      { page: 'reports', fn: initializeReportsView },
      { page: 'alerts', fn: initializeAlertsView },
    ];

    for (const { page, fn } of pages) {
      content.innerHTML = '';
      fetchMock.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<div class="wrapper notifications"></div>')
      });
      document.querySelectorAll('.sidebar a')[0].dataset.page = page;
      await import('../renderer/ui/uiLoader.js');
      fireEvent.click(document.querySelectorAll('.sidebar a')[0]);
      expect(fn).toHaveBeenCalled();
    }
  });

  test('mostra messaggio di errore se la fetch fallisce', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    await import('../renderer/ui/uiLoader.js');
    expect(content.innerHTML).toContain('Error loading view');
  });

});