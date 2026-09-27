import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EventDescriptionText } from './EventDescriptionText';

describe('EventDescriptionText', () => {
  it('renders http links as safe anchors and keeps trailing punctuation outside', () => {
    const html = renderToStaticMarkup(
      <p>
        Class info: <EventDescriptionText text="https://example.com/class." />
      </p>,
    );

    expect(html).toContain(
      '<a href="https://example.com/class" target="_blank" rel="noopener noreferrer"',
    );
    expect(html).toContain('>https://example.com/class</a>.');
  });

  it('leaves ordinary description text unchanged', () => {
    const html = renderToStaticMarkup(
      <p><EventDescriptionText text="Join us for a social dance." /></p>,
    );

    expect(html).toBe('<p>Join us for a social dance.</p>');
  });
});