<!DOCTYPE html>
<html>
    <head>
        <title>{title}</title>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
        }
        #header {
            background: #EEE;
            border-bottom: 1px solid #DDD;
            padding: 1em;
        }
        h1 {
            display: inline;
            margin: 0;
            padding: 0;
            font-weight: normal;
            font-size: 2em;
            color: #000;
        }
        h2 {
            display: inline;
            font-size: 1.25em;
            margin-left: .5em;
            font-weight: bold;
            color: #555;
            letter-spacing: 0.05em;
        }
        #header a {
            color: #3F9FFF;
            font-weight: bold;
            text-decoration: none;
        }
        #header a:hover {
            text-decoration: underline;
        }
        #log{ padding:20px;}
        </style>
    </head>
    <body>
        <div id="header">
            <h1><a href="{url}">{title}</a></h1>
            <h2>{time}</h2>
        </div>
        <div id="log">
            {content}
        </div>
    </body>
</html>