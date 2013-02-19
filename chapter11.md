---
layout: chapter
title: 第十一章 关注用户
---
在这一章中，我们会在现有的网站基础上增加社交功能( social layer )，允许用户关注( follow )其他人(或取消关注)，并在用户主页上显示其关注用户的最新微博( status feed )。我们同样会在用户页面上显示'我的关注'和'我的粉丝'。与此同时，我们将会在[11.1节](chapter11.html#sec-11-1))学习如何构建用户之间的数据库关系,随后在[11.2节](chapter11.html#sec-11-2))(包含一个对Ajax的简单介绍)学习构造网页界面。最后，我们会在[11.3节](chapter11.html#sec-11-3))实现一个完整的微博状态流( status feed )

在最后一章中会包括一些在本教程中最具有挑战的内容，为了实现状态流，我们会使用少量 Ruby/SQL 的小技巧。 通过这些例子，你将会了解 Rails 是如何处理更加复杂的数据模型，而这些知识会在你日后开发其他应用时发挥作用。 为了帮助你从教程学习到独立开发的过渡，在[11.4节](chapter11.html#sec-11-4)我们推荐了几个可以在已有微博核心基础上开发的额外功能，及一些高级资料的链接。

和之前章节一样，Git 用户应该创建一个新的分支

```sh
$ git checkout -b following-users
```

因为这章内容比较有挑战，我们在开始编写代码之前，首先来思考一下网站的界面( interface )。 在之前的章节中， 我们会通过设计原型( mockups )来呈现页面样式。<sup>[1](#fn-1)</sup> 完整的页面流程如下：一名用户 (John Calvin) 从他的个人信息页 ( 图 11.1 ) 跳转到用户页面 ( 图 11.2 ) 去关注一个用户。Calvin 下一步点开了第二名用户 Thomas Hobbes 的个人主页，( 图 11.3 )，点击“关注”键 关注该用户。 与此同时，“关注”按钮变为“取消关注” 并使Hobbes的关注人数加1 ( 图 11.4 )。接下来，Calvin回到自己的主页，他能看到关注人数加1，同时在微博流中能看到Hobbes的新状态 ( 图 11.5 )。接下来的整个章节将会带领您实现这样的页面流程。

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_profile_mockup_bootstrap.png)

图11.1 用户个人信息页

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_user_index_mockup_bootstrap.png)

图11.2 寻找一个用户来关注

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_other_profile_follow_button_mockup_bootstrap.png)

图11.3 一个想要关注的用户信息页，及关注按钮

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_other_profile_unfollow_button_mockup_bootstrap.png)

图11.4 关注按钮变为取消关注的同时，关注人数加1

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_home_page_feed_mockup_bootstrap.png)

图11.5 个人主页出现新关注用户的微博，关注人数加1

<h2 id="sec-11-1">11.1 关系模型</h2>

为了实现关注用户这一功能，第一步我们要做的是创建一个看上去并不是那么直观的数据模型。一开始我们可能会认为一个 **has_many** 的数据关系会满足我们的要求：一个用户可以关注多个用户，同时一个用户还会被多个用户关注。但实际上这个关系存在问题，接下来我们会学习如何正确使用 **has_many** 来解决这个问题。 在本章中，更加复杂的数据模型会让你发现很多东西并不是一上来就能理解，你需要花一点时间思考，来真正搞清楚这样做的原因。 如果你发现自己越发困惑，尝试先往后读，然后再回来读刚才困惑的部分，没准这样会更清楚一点。

<h3 id="sec-11-1-1">11.1.1 数据模型带来的问题(及解决方式) </h3>

作为构造数据模型的第一步，我们先来看一个典型的情况。考虑下述情况,一个用户关注了另外一名用户：比如 Calvin 关注了Hobbes，换句话说 Hobbes 被 Calvin 关注，所以 Calvin 是关注者( following )，而 Hobbes 则是被关注( followed )。 我们使用 Rails 默认的复数表示习惯， 我们称关注某一特定用户的用户集合为该特定用户的 followers，进而 **user.followers** 则成为一个关注用户组成的列表。 不幸的是，当我们颠倒一下顺序，上述关系则不成立了： 默认情况下，所有我们关注的用户称之为 followeds，这实际上在英语语法上并不是非常通顺恰当。虽然我们可以称他们为 following，但这有些歧义：在英语里，"following" 指关注你的人，和我们想表达的恰恰相反。考虑到上述两种情况，尽管我们将使用 "following" 作为页面显示时的标签，如 “50 following,75 followers”, 我们在数据模型上会使用 "followed users"来标记我们关注的用户集合。

经过上述的讨论，我们会按照( 图 11.6 )的方式来对 followed users 进行建模， 包含一个 followed_users 表及一个一对多的关系。












