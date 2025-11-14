import { useEffect, useState } from 'react';

const TOKEN_URL = process.env.REACT_APP_SSO_TOKEN_URL;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const GRANT_TYPE = process.env.REACT_APP_GRANT_TYPE;

const CODE_VERIFIER_KEY = 'phj_pkce_code_verifier';
const ACCESS_TOKEN_KEY = 'phj_access_token';

function CallBack() {
  const [error, setError] = useState(null);
  const [details, setDetails] = useState('Обрабатываем ответ авторизации...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const err = params.get('error') || params.get('error_description');

    if (err) {
      setError('Ошибка от сервера авторизации');
      setDetails(`${err}`);
      return;
    }

    if (!code) {
      setError('Параметр code не найден в URL');
      setDetails(window.location.search || 'Пустой query string');
      return;
    }

    const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);

    if (!codeVerifier) {
      setError('PKCE code_verifier не найден в localStorage');
      setDetails(`Ожидали ключ "${CODE_VERIFIER_KEY}"`);
      return;
    }

    const body = new URLSearchParams();
    body.set('code', code);
    if (state) body.set('state', state);
    body.set('code_verifier', codeVerifier);
    body.set('grant_type', GRANT_TYPE);
    body.set('client_id', CLIENT_ID);

    setDetails('Отправляем запрос на получение токена...');

    fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw { status: res.status, data };
        }
        return data;
      })
      .then((data) => {
        const accessToken = data.access_token;
        if (accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        }

        localStorage.removeItem(CODE_VERIFIER_KEY);

        setError(null);
        setDetails(JSON.stringify(data, null, 2));

        // TODO: здесь можно сделать редирект, как в Next-проекте
      })
      .catch((e) => {
        console.error('Token request error:', e);
        setError('Не удалось получить токен');
        setDetails(JSON.stringify(e, null, 2));
      });
  }, []);

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <h1>Callback</h1>
      {error && <div style={{ color: 'red', marginBottom: '8px' }}>{error}</div>}
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{details}</pre>
    </div>
  );
}

export default CallBack;
