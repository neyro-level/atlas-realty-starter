import Link from 'next/link'

export function AdminLoginHeading() {
  return <h1 className="ams-admin-login-heading">Управление сайтом</h1>
}

export function AdminLoginBackLink() {
  return (
    <Link className="ams-admin-login-back" href="/">
      Вернуться на сайт
    </Link>
  )
}
