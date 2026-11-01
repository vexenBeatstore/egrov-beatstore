const API = globalThis.R4L_API || "/api/v1";
export async function request(path, options={}) {
  const res = await fetch(`${API}${path}`, {credentials:"include", ...options,
    headers:{"Content-Type":"application/json", ...(options.headers||{})}});
  const data = await res.json().catch(()=>({error:"Некорректный ответ сервера"}));
  if(!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data;
}
export const get = path => request(path);
export const post = (path, body) => request(path,{method:"POST",body:JSON.stringify(body)});
