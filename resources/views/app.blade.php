<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
    <link rel="icon" type="image/png" href="{{ asset('img/favicon4.png') }}">
</head>
<body>
    @inertia
</body>
</html>