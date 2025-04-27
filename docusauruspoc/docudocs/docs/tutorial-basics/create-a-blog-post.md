---
sidebar_position: 3
---

---
title: Table Props
---

# Table Props

| Prop | Type | Default | Required | Description |
|-----|:------|:--------|:--------|:------------|
| columns | TableColumn[] | - | Yes |  |
| data | object[] | - | Yes |  |


<details>
<summary><b>columns (expand nested fields)</b></summary>

| &nbsp;&nbsp;Prop | Type | Default | Required | Description |
|-------|:------|:--------|:--------|:------------|
| &nbsp;&nbsp;accessor | string | - | Yes |  |
| &nbsp;&nbsp;header | string | - | Yes |  |



</details>





| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Blog Index Page        | A page that lists all blog posts.                                          |
| Tag System             | A way to categorize and filter blog posts using tags.                     |
| RSS Feed               | A feed that allows users to subscribe to updates for your blog.           |
| Individual Blog Pages  | Each blog post gets its own dedicated page with a unique URL.             |
# Create a Blog Post

Docusaurus creates a **page for each blog post**, but also a **blog index page**, a **tag system**, an **RSS** feed...

## Create your first Post

Create a file at `blog/2021-02-28-greetings.md`:

```md title="blog/2021-02-28-greetings.md"
---
slug: greetings
title: Greetings!
authors:
  - name: Joel Marcey
    title: Co-creator of Docusaurus 1
    url: https://github.com/JoelMarcey
    image_url: https://github.com/JoelMarcey.png
  - name: Sébastien Lorber
    title: Docusaurus maintainer
    url: https://sebastienlorber.com
    image_url: https://github.com/slorber.png
tags: [greetings]
---

Congratulations, you have made your first post!

Feel free to play around and edit this post as much as you like.
```

A new blog post is now available at [http://localhost:3000/blog/greetings](http://localhost:3000/blog/greetings).
