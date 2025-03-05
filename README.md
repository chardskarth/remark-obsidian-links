# Introduce

a [remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md) that converts [obsidian internal links](https://help.obsidian.md/Linking+notes+and+files/Internal+links) into _common links_ or _images_

- make sure that the route must be internal path
  - **e.g.** `[[link]]` or `![[image]]`

# Init

```shell
pnpm i -D remark-obsidian-links
```

```js
import convertObsidianLinks from "remark-obsidian-links"; // exported as default
```

## Obsidian Setting

It is recommended to use the **full path(absolute path)** of links for `obsidian internal links`, so that you can replace some part of the path without worrying wherever your markdown file located on (by default, obsidian links direct to the closest file)

you can enable this at
`obsidian > setting(preferences) > Files & Links > New link foramt` to `Absolute path in vault`.

# Examples

## `[[link]]`

### only id

````md
- source

```md
[[#Section 2]]
```

- yields

```html
<a href="#section-2">Section 2</a>
```
````

- the **id** will be slugified with [default slugify function](#slugify), but you can use your own by passing through `options.slugify`

### default(link = value)

````md
- source

```md
[[src/posts/1. my post]]
```

- yields

```html
<a href="src/posts/1-my-post">src/posts/1-my-post</a>
```

- or yields (options.linkPrefix = ['src', ''])

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

- yields

```html
<a href="src/posts/my-post">My Post</a>
```

- or yields (options.linkPrefix = ['src', ''])

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

- yields

```html
<a href="src/posts/my-post#section-2">My Post Section 2</a>
```

- or yields (options.linkPrefix = ['src', ''])

```html
<a href="/posts/my-post#section-2">My Post Section 2</a>
```
````

## `![[image]]`

### default(alt = src)

````md
- source

```md
![[static/img/image1.png]]
```

- yields

```html
<img src="static/img/image1.png" alt="static/img/image1.png" />
```

- or yields (options.imagePrefix = ['static', ''])

```html
<img src="/img/image1.png" alt="/img/image1.png" />
```
````

- you can replace some part of your image path with `options.imagePrefix`

### image with alt

````md
- source

```md
![[static/img/image1.png|first image]]
```

- yields

```html
<img src="static/img/image1.png" alt="first image" />
```

- or yields (options.imagePrefix = ['static', ''])

```html
<img src="/img/image1.png" alt="first image" />
```
````

# Options

| Option          | Description                                                                                                                                                                                                                                                                                | Default value       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **imagePrefix** | if exist, _replace path_ for the **image**.<br>it takes a _string tuple_ which length is 2,<br>and its elements are `from` and `to` consequently.<br><br>**e.g.** `{imagePrefix: ['static', '']}`<br>=> remove `'static'` from the path<br><br>**Type**: `[string, string]` \| `undefined` | `[]`                |
| **linkPrefix**  | if exist, _replace path_ for the **link**.<br>it takes a _string tuple_ which length is 2,<br>and its elements are `from` and `to` consequently.<br><br>**e.g.** `{linkPrefix: ['src', '']}`<br>=> remove `'src'` from the path.<br><br>**Type**: `[string, string]` \| undefined          | `[]`                |
| **linkClass**   | the class added to `<a>` element, if the link is NOT just an id(e.g. `[[#section1]]`)<br><br>**Type** : `string` \| `string[]` \| `undefined`                                                                                                                                              | `"link-page"`       |
| **idClass**     | the class added to `<a>` element, if the link is just an id(e.g. `[[#section1]]`)<br><br>**Type**: `string` \| `string[]` \| `undefined`                                                                                                                                                   | `"link-id"`         |
| **slugify**     | slugify function for filename and id.<br>if pass a custom function, replace the [default slugify function](#slugify).<br>if pass `"none"`, it does not perform the slugifying process.<br><br>**Type**: `(string) => string` \| `"none"` \| `undefined`                                    | [slugify](#slugify) |

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

- default slugify function performs below
  1.  change all _alphabet characters_ into **lowercase**
  2.  change all characters into `-`character, without `a-z` | `A-Z` | `0-9` | `_` characters
  3.  delete first and last `-` characters

# License

MIT
