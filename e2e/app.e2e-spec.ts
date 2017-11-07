import { FrontendWebviewPage } from './app.po';

describe('frontend-webview App', () => {
  let page: FrontendWebviewPage;

  beforeEach(() => {
    page = new FrontendWebviewPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
