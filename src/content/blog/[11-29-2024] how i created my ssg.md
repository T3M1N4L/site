---
title: how i created my ssg!
description: built my own static site generator, wrestled with markdown, scss, and xml—turned chaos into something kinda cool. here’s how it went down.
date: 11/29/2024 00:00:00
color: teal

page-type: post

styles:
  - /style.css
---

i've always wanted to make a website, a website that looked like what i wanted it to look like as well as server a purpose. i knew what i had to do, make a personal website! thats what your viewing this blog on rn... and then i tought that i'd prolly use this site for a long time, so it should be able to suit my needs. so i decided to create an ssg.

i wanted a challenge—something not too difficult to create, but just tricky enough to fit my needs.

the needs in question:
- markdown support
- a consistent layout
- easy metadata management
- scss support

so, i knew how i was gonna start: i installed a markdown library called ‘marked.’ it’s a simple tool that turns markdown into html. but metadata had me a little stumped… i could go with the traditional yaml method, or i could try something different. in the end, i went with xml because it allowed for perfect syntax highlighting in md files. for scss, i just used the sass library on npm and called it a day.

funny story: i was conflicted about file extensions. i started with xml and was like, “what the f*ck, who makes a site in xml?” then i switched to html, but it didn’t have markdown syntax highlighting, so i finally just went with the classic md file extension.

the metadata setup was pretty cool. i had a root file that was basically a template with different parameters like commit hashes, titles, etc. that was really nice and handy…

but making my blog made the build code a little (okay, a shit ton) harder to read. but i’ll manage… eh… eventually?

anyways, byeeeee