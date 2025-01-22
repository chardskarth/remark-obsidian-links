# Introduce

a [remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md) that converts [obsidian internal links](https://help.obsidian.md/Linking+notes+and+files/Internal+links) into _common links_ or _images_

- make sure that the route must be internal path

# Init

```shell
pnpm i -D @gocoder/remark-obsidian-links
```

## Obsidian Setting

It is recommended to use the **full path(absolute path)** of links for `obsidian internal links`, so that you can replace some part of the path without worrying wherever your markdown file located on

you can set this at `obsidian > setting(preferences) > Files & Links > New link foramt` to `Absolute path in vault`.

# Examples

## `[[link]]`

### only id

````md
- source

```md
[[#Section 2]]
```

- into

```html
<a href="#section-2">Section 2</a>
```
````

- the **id** will be slugified with [default slugify function](#slugify), but you can use your own by passing through `options.slugify`

### only link

````md
- source

```md
[[src/posts/1. my post]]
```

- into

```html
<a href="src/posts/1-my-post">src/posts/1-my-post</a>
```

- or into (options.linkPrefix = ['src', ''])

```html
<a href="/posts/1-my-post">/posts/1-my-post</a>
```
````

- the **filename** will be slugified with [default slugify function](#slugify), but you can use your own by passing through `options.slugify`
- you can replace some part of your link path with `options.linkPrefix`

### link with label

````md
- source

```md
[[src/posts/my-post|My Post]]
```

- into

```html
<a href="src/posts/my-post">My Post</a>
```

- or into (options.linkPrefix = ['src', ''])

```html
<a href="/posts/my-post">My Post</a>
```
````

### link with id & label

````md
- source

```md
[[src/posts/my-post#Section 2|My Post Section 2]]
```

- into

```html
<a href="src/posts/my-post#section-2">My Post Section 2</a>
```

- or into (options.linkPrefix = ['src', ''])

```html
<a href="/posts/my-post#section-2">My Post Section 2</a>
```
````

## `![[image]]`

### default(alt = src)

````md
- from

```md
![[static/img/image1.png]]
```

- to

```html
<img src="static/img/image1.png" alt="static/img/image1.png" />
```

- or to (options.imagePrefix = ['static', ''])

```html
<img src="/img/image1.png" alt="/img/image1.png" />
```
````

- you can replace some part of your image path with `options.imagePrefix`

### with alt

````md
- from

```md
![[static/img/image1.png|first image]]
```

- to

```html
<img src="static/img/image1.png" alt="first image" />
```

- or to (options.imagePrefix = ['static', ''])

```html
<img src="/img/image1.png" alt="first image" />
```
````

# Options

| Option          | Description                                                                                                                                                                                                                                                          | Default value       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **imagePrefix** | if exist, _replace path_ for the **image**.<br>it takes an _string array_ which length is 2,<br>and its elements are `from` and `to` consequently.<br>e.g. `{imagePrefix: ['static', '']}`<br>=> remove `'static'` from the path<br>type: `string[2]` \| `undefined` | `[]`                |
| **linkPrefix**  | if exist, _replace path_ for the **link**.<br>it takes an _string array_ which length is 2,<br>and its elements are `from` and `to` consequently.<br>e.g. `{linkPrefix: ['src', '']}`<br>=> remove `'src'` from the path.<br>type: `string[2]` \| undefined          | `[]`                |
| **linkClass**   | the class added to `<a>` element.<br>type : `string` \| `string[]` \| `undefined`                                                                                                                                                                                    | `"link-page"`       |
| **idClass**     | the class added to `<a>` element for id link (e.g. `[[#section2]]`) instead of the **linkClass** one.<br>type: `string` \| `string[]` \| `undefined`                                                                                                                 | `"link-id"`         |
| **slugify**     | if exist, replace the [default slugify function](#slugify) that _slugify_ the **id**.<br>type: `(string) => string` \| `"none"` \| `undefined`                                                                                                                       | [slugify](#slugify) |

- if you need any **additional options**, feel free to leave an **issue**!

## slugify

```js
function slugify(str) {
	return str
		.toLowerCase()
		.replace(/[^\w]+/g, '-')
		.replace(/(^-|-$)+/g, '');
	}
}
```

# License

MIT
