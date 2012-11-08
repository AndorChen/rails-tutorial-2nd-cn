---
layout: chapter
title: 第五章 完善布局
---

学习了[第四章](chapter4.html)，我们对 Ruby 也大概了解了，也晓得怎么把样式表引入程序里了，不过，在[4.3.4 节](chapter4.html#sec-4-3-4)里就说过了，这个样式表里还什么都没有呢，不过不用怕，这一切都将在这一章改变。在这一章我们会引入一个叫 Bootstrap 的框架，然后再添加一些自定义的样式。[^1]当然了，之前做的那些页面（“Home”、”Help“ 和 ”About“），肯定也会被添加进来的[5.1 节](#sec-5-1)。顺便我们还要学习 partials、Rails 路由和 asset pipeline，甚至还会包括一点点 Sass 的内容[5.2 节](#sec-5-2)，[第三章](chapter3.html)的那些测试也需要重构，最后我们还要实现一个注册的功能。

<h2 id="sec-5-1">5.1 添加一些结构</h2>

虽然说，这是一本关于 Web 开发而不是 Web 设计的书，但是如果知道自己开发的只能是个12306一样的东西，那这绝对不是什么振奋人心的消息。所以，在这一部分我们要添加一些必要的部分，然后用 CSS 来让样式更漂亮一点。不过我们并不只是手写 CSS，还会使用一个由 Twitter 开发的开源 Web 设计框架 [Bootstrap](http://twitter.github.com/bootstrap/)。另外，会用到 partials 技术来让代码更整洁。

在Web 开发中，对用户界面尽早做出规划，对于开发是很有帮助的。后面我会经常插入构思图（在网页领域一般叫做“线框图”），其实也就是设想的应用最后大概会长成什么样的草图。[^2]这节我们主要是开发[3.1 节](chapter3.html#sec-3.1)中的静态页面，里面会包含一个网站LOGO、头部导航条和网页底部。[图 5.1](#figure-5-1)是 Home 页面的构思图，很明显这是最重要的页面。[图 5.7](#figure-5-7)是最终完成后的样子，虽然和构思的不太一样，比如，页面里有一个 Rails 的 LOGO，不过这也没什么大不了的，构思图嘛，没必要太准确。

<p id="figure-5-1">![home_page_mockup_bootstrap](assets/images/figures/home_page_mockup_bootstrap.png)

图 5.1：示例程序“首页”的构思图

照旧，如果你是用 Git 做版本控制的话，是时候创建一个新的分支了：

{% highlight sh %}
$ git checkout -b filling-in-layout
{% endhighlight %}

<h3 id="sec-5-1-1">5.1.1 网站导航</h3>

要在示例程序中添加链接和样式，首先我们要给 `application.html.erb` 这个文件（上次见到它是在[代码 4.3]里）增加一些 HTML 结构。添加一些区域、一些 CSS 类、以及网站导航条。这个文件的全部内容在[代码 5.1](#list-5-1)中，下面我们会对各部分代码进行解释，如果你实在等不及，[图 5.2](#figure-5.2)是最终结果。（注：虽然是最终结果，但其实不是那么让人满意）

<p id="list-5-1"><p>**代码 5.1** 添加一些结构后的网站布局文件 <br />`app/views/layouts/application.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title><%= full_title(yield(:title)) %></title>
    <%= stylesheet_link_tag    "application", media: "all" %>
    <%= javascript_include_tag "application" %>
    <%= csrf_meta_tags %>
    <!--[if lt IE 9]>
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
  </head>
  <body>
    <header class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">
          <%= link_to "sample app", '#', id: "logo" %>
          <nav>
            <ul class="nav pull-right">
              <li><%= link_to "Home",    '#' %></li>
              <li><%= link_to "Help",    '#' %></li>
              <li><%= link_to "Sign in", '#' %></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    <div class="container">
      <%= yield %>
    </div>
  </body>
</html>
{% endhighlight %}


有一点要注意，哈希在 Ruby 1.8 与 Ruby 1.9 中长的不太一样（参见[4.3.3 节](chapter4.html#sec-4-3-3)）。把下面的

{% highlight erb %}
<%= stylesheet_link_tag "application", :media => "all" %>
{% endhighlight %}

换成下面这样

{% highlight erb %}
<%= stylesheet_link_tag "application", media: "all" %>
{% endhighlight %}

因为旧的哈希写法流传很广，所以这两种写法你必须都能识别出来。

我们从头到尾看一下[代码 5.1](#list-5-1)中新添加的元素。在[3.1 节]里我曾经提过，Rails 3 默认会使用 HTML5（这一点从 `<!DOCYTYPE html>` 就能看出来）；因为相对来说，HTML5 标准还很新，有些浏览器（尤其是旧版本 IE）还不能完全支持，所以我们添加了一些 JavaScript 代码（[HTML5 shim](http://code.google.com/p/html5shim/)）来解决这个问题。

{% highlight html %}
<!--[if lt IE 9]>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
{% endhighlight %}

比如下面这段比较奇怪的代码

{% highlight html %}
&lt;!--[if lt IE 9]&gt;
{% endhighlight %}

意思就是，当浏览器是版本号低于 9 的 IE 时（`if lt IE 9`），才会加载这段代码。这种奇怪的句法`[if lt IE 9]`并不是 Rails 提供的；其实这是 IE 为了解决上面的兼容问题而专门提供的[条件注释](http://en.wikipedia.org/wiki/Conditional_comment)。这样的好处是，既解决了低版本 IE 的兼容问题，又不会影响其他的 Firefox、Chrome、Safari等浏览器。

接下来是一个 `header` 区，其中包含了网站的纯文本LOGO、一些用 `div` 标签分隔的区块以及一个列表形式的导航链接：

{% highlight erb %}
<header class="navbar navbar-fixed-top">
    <div class="navbar-inner">
        <div class="container">
            <%= link_to "sample app", '#', id: "logo" %>
            <nav>
                <ul class="nav pull-right">
                    <li><%= link_to "Home",    '#' %></li>
                    <li><%= link_to "Help",    '#' %></li>
                    <li><%= link_to "Sign in", '#' %></li>
                </ul>
            </nav>
        </div>
    </div>
</header>
{% endhighlight %}

`header` 标签是用来表明这些内容应该放在页面的顶部。我们给 `header` 标签添加了两个 CSS class[^3]，分别叫做 `navbar` 和 `navbar-fixed-top`，两者之间用一个空格分开。

{% highlight html %}
<header class="navbar navbar-fixed-top">
{% endhighlight %}

所有的 HTML 元素都可以分配 class 和 id；它们可不仅仅只是标识，在 CSS 中是要派大用场的（[5.1.2 节](#sec-5-1-2)）。class 和 id 的主要区别在，在同一个页面中，class 可以用很多次，而 id 只能用一次。上面的 `navbar` 和 `navbar-fixed-top` 在 Bootstrap 框架（我们会在[5.1.2 节](#sec-5-1-2)安装使用）中都有特殊的意义。

可以看到 `header` 标签里，还有两个 `div` 标签：

{% highlight html %}
<div class="navbar-inner">
    <div class="container">
{% endhighlight %}

`div` 标签是常规区域，除了把文档分成不同的部分之外，没有特殊的意义。在以前的 HTML 中，几乎所有的区域都用 `div` 标签来划分，不过 HTML5 增加了 `header`、`nav` 和 `section` 元素，专门用来划分大多数网站中都会用到的区域。上面每个 `div` 也都指定了一个 CSS class。和 `header` 标签的 class 一样，这些 class 在 Bootstrap 中也有特殊的意义。

在这些 `div` 之后，有一些 ERb 代码：

{% highlight erb %}
<%= link_to "sample app", '#', id: "logo" %>
<nav>
  <ul class="nav pull-right">
    <li><%= link_to "Home",    '#' %></li>
    <li><%= link_to "Help",    '#' %></li>
    <li><%= link_to "Sign in", '#' %></li>
  </ul>
</nav>
{% endhighlight %}

这里用到了 Rails 的 `link_to` 帮助方法来创建链接（之前在 [3.3.2 节](chapter3.html#sec-3-3-2)中我们都是直接用 `a` 标签来实现的）；`link_to` 方法可以有三个参数，第一个参数是链接文本，第二个是链接地址。到[5.3.3 节]的时候我们会通过设置路由来为链接制定地址，现在先拿占位符 `#` 将就一下。第三个参数则是可选的，是一个哈希数组，上面我们用它来为这个链接添加了一个 CSS id `logo`。（另外三个链接没有第三个参数，因为这个参数并不是必须的。）可选的哈希参数在 Rails 的帮助方法中经常会用到，通过它我们可以为 HTML 标签灵活的添加各种属性。

`div` 中的第二个元素是一个列表形式的导航链接，使用了无序列表的标签 `ul`，以及列表项目标签 `li`：

{% highlight erb %}
<nav>
  <ul class="nav pull-right">
    <li><%= link_to "Home",    '#' %></li>
    <li><%= link_to "Help",    '#' %></li>
    <li><%= link_to "Sign in", '#' %></li>
  </ul>
</nav>
{% endhighlight %}

这里的 `nav` 标签其实并不是必须的，他的作用只在于区分出导航链接的区域。而 `ul` 标签的 `nav` 和 `pull-right` class 则依然是因为在 Bootstrap 中有特殊意义而存在的。上面的代码运行之后生成的 HTML 代码是下面这样的：

{% highlight erb %}
<nav>
  <ul class="nav pull-right">
    <li><a href="#">Home</a></li>
    <li><a href="#">Help</a></li>
    <li><a href="#">Sign in</a></li>
  </ul>
</nav>
{% endhighlight %}

布局文件中的最后一个 `div` 部分，是主内容区域：

{% highlight erb %}
<div class="container">
  <%= yield %>
</div>
{% endhighlight %}

同上，这个 `container` class 还是在Bootstrap 中有专门意思。`yield` 方法会把每个页面的内容插入到网站的布局当中，这个在[3.3.4 节](chapter3.html#sec-3-3-4)介绍过。

整个布局基本完成了（剩下的网站底部，我们会在[5.1.3 节](#sec-5-1-3)添加），访问 Home 页面就可以看到结果。为了用到上面添加的内容，我们还得往 `home.html.erb` 里面加些额外的东西。（[代码 5.2](#list-5-2)）

<p id="list-5-2"></p>**代码 5.2** “首页”的代码，包含一个到注册页面的链接 <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<div class="center hero-unit">
  <h1>Welcome to the Sample App</h1>

  <h2>
    This is the home page for the
    <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
    sample application.
  </h2>

  <%= link_to "Sign up now!", '#', class: "btn btn-large btn-primary" %>
</div>

<%= link_to image_tag("rails.png", alt: "Rails"), 'http://rubyonrails.org/' %>
{% endhighlight %}

上面代码中的第一个 `link_to` 方法，创建了一个链接，在[第七章](chapter7.html)我们会将它只想用户注册页面，这段代码生成的 HTML 是下面这样：

{% highlight erb %}
<a href="#" class="btn btn-large btn-primary">Sign up now!</a>
{% endhighlight %}

我都不愿意说了，`div` 标签里的 `hero-unit` class 在 Bootstrap 里有用，`btn`、 `btn-large`、`btn-primary`也是。

第二个 `link_to` 里用到了 `image_tag` 帮助方法，`image_tag` 的第一个参数是图片的路径，第二个则是可选的哈希数组，这里我们用了一个 symbol 作为键来设置图片的 `alt` 属性。为了看得更清楚一点，下面是生成的 HTML：[^4]

{% highlight html %}
<img alt="Rails" src="/assets/rails.png" />
{% endhighlight %}

如果图片无法加载，那么浏览器就会显示 `alt` 属性的内容，而为视障人士设计的屏幕阅读器中也会显示这个属性的内容。虽然 HTML 标准要求图片中必须包含 `alt` 属性，不过大家还是都懒得写。幸好 Rails 准备了一个默认的 `alt` 属性；如果在 `image_tag` 里没有指定的话，Rails 会直接使用这个图片的文件名。上面我们自己设定了 `alt` 属性为首字母大写的 “Rails”。

终于到检查成果的时候了（[图 5.2](#figure-5-2)）。其实不怎么样，对吧。不过好在我们已经给我们的 HTML 元素指定了合适的 class，下面我们可以很容易的添加 CSS 了。

你可能会奇怪，为什么 `rails.png` 这个不存在的图片居然显示出来了？这不科学啊！其实每个 Rails 程序里都包含了这个图片，存在路径是 `app/assets/images/rails.png`。因为我们使用了 `image_tag` 帮助方法，所以 Rails 会自动通过 asset pipeline 找到图片（[5.2 节](#section-5-2)）。

<p id="figure-5-2></p>"![layout_no_logo_or_custom_css_bootstrap](assets/images/figures/layout_no_logo_or_custom_css_bootstrap.png)

图 5.2：没有定义 CSS 的“首页”（[/static_pages/home](http://localhost:3000/static_pages/home)）

<h3 id="sec-5-1-2">5.1.2 Bootstrap 和自定义 CSS</h3>

在[5.1.1节](#sec-5-1-1)我们给很多 HTML 元素都指定了 CSS class，这样就可以很方便的利用 CSS 来构建布局了。 [5.1.1 节](#sec-5-1-1)里就说过， Twitter 提供的 [Bootstrap](http://twitter.github.com/bootstrap/) 框架，可以方便的把精美的 Web 设计和用户界面元素加入到一个使用 HTML5的 应用中，而我们指定的这些 CSS class 在这个框架里也都有专门的用途。这一节里，我们就会用到 Bootstrap，并且自定义一些 CSS 来改变现在的这个应用。

第一步自然是安装 Bootstrap，在 Rails 程序里可以直接使用 bootstrap-sass 这个 gem，参见[代码 5.3](#list-5-3)。Bootstrap 框架本身使用的是 [LESS CSS](http://lesscss.org/)语言来生成动态的样式表，不过，Rails 默认支持的是和它很像的 Sass 语言（[5.2 节](#sec-5-2)），所以需要让 bootstrap-sass 把 LESS 转换成 Sass，而且让 Bootstrap 中所有必须用到的文件都可以在当前的这个程序里使用。[^5]


<p id="list-5-3">**代码 5.3**</p>把 bootstrap-sass 加入 `Gemfile`

{% highlight ruby %}
source 'https://rubygems.org'

gem 'rails', '3.2.8'
gem 'bootstrap-sass', '2.0.4'
.
.
.
{% endhighlight %}

运行 `bundle install` 来安装：

{% highlight sh %}
$ bundle install
{% endhighlight %}

因为修改了 Gemfile，所以必须重启 Web 服务器之后，改动才能生效。（一般是按 Ctrl-C 然后运行 `rails server`）

想要给应用添加自定义的 CSS，就得先创建一个 CSS 文件：

{% highlight text %}
app/assets/stylesheets/custom.css.scss
{% endhighlight %}

（用文本编辑器还是 IDE 创建这个文件，随你）文件存放的目录和文件名都很重要。下面是目录

{% highlight text %}
app/assets/stylesheets
{% endhighlight %}

这个目录是 asset pipeline 的一部分，目录中的所有样式表都会自动被引入到网站布局的 `application.css` 中。此外，`custom.css.scss` 的文件扩展名中的 `.css` 表明这是个 CSS 文件，而 `.scss` 部分则表明这同时也是一个“Sassy CSS”文件，并且通知了 asset pipeline 使用 Sass 来处理这个文件。（到[5.2.2 节](#sec-5-2-2)我们才会用到 Sass，不过现在需要它才能让 bootstrap-sass 运行起来。）

新建完文件之后，我们就可以使用 `@import` 来引入 Bootstrap，参见[代码 5.4](#list-5-4)

<p id="list-5-4"></p>**代码 5.4** 引入 Bootstrap <br />`app/assets/stylesheets/custom.css.scss`

{% highlight css %}
@import "bootstrap";
{% endhighlight %}

这样就引入了整个 Bootstrap CSS 框架，[图 5.4](#figure-5-4)是效果。（你可能还得重启一次服务器。）虽然，文本的位置不太对，LOGO 也一点形都没有，不过整体色调还有那个注册按钮看起来还蛮酷的。

<p id="figure-5-4"></p>![sample_app_only_bootstrap](assets/images/figures/sample_app_only_bootstrap.png)

图 5.3：使用 Bootstrap CSS 后的示例程序

下面我们要添加一些 CSS，给整个网站布局和各个单独的页面增加一些样式。[代码 5.5](#list-5-5)里规则挺多的，为了便于理解，我们会加入一些注释，注释要放在 `/* ... */` 里面。加载了这部分代码之后的效果在[图 5.4](#figure-5-4)。

<p id="list-5-5"></p>**代码 5.5** 添加全站使用的 CSS <br />`app/assets/stylesheets/custom.css.scss`

{% highlight css %}
@import "bootstrap";

/* universal */

html {
  overflow-y: scroll;
}

body {
  padding-top: 60px;
}

section {
  overflow: auto;
}

textarea {
  resize: vertical;
}

.center {
  text-align: center;
}

.center h1 {
  margin-bottom: 10px;
}
{% endhighlight %}

<p id="figure-5-4"></p>"![sample_app_universal](assets/images/figures/sample_app_universal.png)

图 5.4：添加一些空白和其他的全局样式

[代码 5.5](#list-5-5)中的 CSS 格式是很统一的。一般来说，CSS 分别通过 class、 id、 HTML 标签、或者三者结合来绑定后面的样式声明。举个栗子：

{% highlight css %}
body {
  padding-top: 60px;
}
{% endhighlight %}

上面这段是用来指定页面的上边距为 60 像素。虽然，`header` 标签也在 `body` 中，不过我们为它指定了 `navbar-fixed-top` class，所以 Bootstrap 就把导航条放到了页面的最上端，于是这个上边距就正好把主内容区和导航条分开了。下面这段：

{% highlight css %}
.center {
  text-align: center;
}
{% endhighlight %}

把 `.center` class 的样式定义为 `text-align: center`。`.center` 中的那个点说明这是绑定在一个 class 上的。（在[代码 5.7](#list-5-7)里我们会看到 `#`，这个符号说明样式是绑定在一个 id 上。）所以，任何一个含有 `.center` class 的元素的内容都会在页面中居中显示。（[代码 5.2](#list-5-2) 中有用到这个 class。）

虽然 Bootstrap 本身的排版样式就很漂亮，我们还是得给网站的文字显示自定义一些样式，具体见[代码 5.6](#list-5-6)。（有些规则并不会应用在 Home 页面，不过这里的规则都绝对会在这个应用中用到。）效果看[图 5.5](#figure-5-5)

<p id="list-5-6"></p>**代码 5.6** 添加一些文字排版样式 <br />`app/assets/stylesheets/custom.css.scss`

{% highlight css %}
@import "bootstrap";
.
.
.

/* typography */

h1, h2, h3, h4, h5, h6 {
  line-height: 1;
}

h1 {
  font-size: 3em;
  letter-spacing: -2px;
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  font-size: 1.7em;
  letter-spacing: -1px;
  margin-bottom: 30px;
  text-align: center;
  font-weight: normal;
  color: #999;
}

p {
  font-size: 1.1em;
  line-height: 1.7em;
}
{% endhighlight %}

<p id="figure-5-5"></p>![sample_app_typography](assets/images/figures/sample_app_typography.png)

图 5.5：添加了一些文字排版样式

最后，我们就要给网站LOGO添加样式了，这个LOGO现在还是可怜的纯文本 “sample app”。[代码 5.7](#list-5-7)中的 CSS 把文字变成了大写字母，还改变了文字的字号、颜色和文职。（我这里是用的 id 来指定样式，因为网站LOGO只会在页面中出现一次，不过其实你也可以用 class 来代替）


<p id="list-5-7"></p>**代码 5.7** 添加网站 LOGO 的样式 <br />`app/assets/stylesheets/custom.css.scss`

{% highlight css %}
@import "bootstrap";
.
.
.

/* header */

#logo {
  float: left;
  margin-right: 10px;
  font-size: 1.7em;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: -1px;
  padding-top: 9px;
  font-weight: bold;
  line-height: 1;
}

#logo:hover {
  color: #fff;
  text-decoration: none;     
}
{% endhighlight %}

这里的 `color: #fff` 会把LOGO的文字颜色变成白色。HTML 中的颜色可以由 3 个 16 进制数组成，分别表示红绿蓝这三种颜色的值。`#ffffff` 表示三种颜色都是最大值，效果就是白色，可以简写成 `#fff`。CSS 标准里给很多常用的 [HTML 颜色](http://www.w3schools.com/html/html_colornames.asp)都定义了别名，比如 `white` 就是 `#fff` 的别名。效果见[图 5.6](#figure-5-6)

<p id="figure-5-6"></p>![sample_app_logo](assets/images/figures/sample_app_logo.png)

图 5.6：样式化 LOGO 后的示例程序

<h3 id="sec-5-1-3">5.1.3 局部视图</h3>

虽然[代码 5.1](#list-5-1)中的布局达到了目标，不过代码看起来还是有点混乱。其中， HTML shim 就占用了三行，而且还使用了只针对 IE 的奇怪句法，所以如果能把这些打包起来放在一个地方就好了。头部的 HTML 本身组成了一个逻辑但元，所以，这部分也应该打包出来。上面说的这些，在 Rails 中我们都是用一种叫 partial 的技术来实现的。先看一下，使用了 partial 之后的布局文件（见[代码 5.8](#list-5-8)）

<p id="list-5-8"></p>**代码 5.8** 定义了 HTML shim 和头部局部视图之后的网站布局 <br />`app/views/layouts/application.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title><%= full_title(yield(:title)) %></title>
    <%= stylesheet_link_tag    "application", media: "all" %>
    <%= javascript_include_tag "application" %>
    <%= csrf_meta_tags %>
    <%= render 'layouts/shim' %>
  </head>
  <body>
    <%= render 'layouts/header' %>
    <div class="container">
      <%= yield %>
    </div>
  </body>
</html>
{% endhighlight %}

[代码 5.8](#list-5-8)中，我们通过调用一个 Rails 帮助方法 `render` ，替换掉了那三行 HTML shim。

{% highlight erb %}
<%= render 'layouts/shim' %>
{% endhighlight %}

这行的作用就是找到并处理一个叫 `app/views/layouts/_shim.html.erb` 的文件，然后把里面的内容插入到视图中去。[^6]（回忆一下，这个 <%= ... %> 是用来插入 Ruby 表达式，然后再把运算之后的内容插入到模板中去的）注意文件名前面的那个下划线；这是 paritial 中的命名约定，这样就可以在目录中快速定位到 partial 文件。

想要 partial 起作用，就得写入相应的内容。这个 partial 只需要 [代码 5.1](list-5-1)中的那三行就够了。见[代码5.9](#list-5-9)

<p id="list-5-9"></p>**代码 5.9** HTML shim partial <br />`app/views/layouts/_shim.html.erb`

{% highlight erb %}
<!--[if lt IE 9]>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
{% endhighlight %}

我们也需要头部的内容移到 partial 中，见[代码 5.10](#list-5-10)，然后用 `render` 再把这部分插入到布局中去。

**代码 5.10** 网站头部的 partial <br />`app/views/layouts/_header.html.erb`

{% highlight erb %}
<header class="navbar navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container">
      <%= link_to "sample app", '#', id: "logo" %>
      <nav>
        <ul class="nav pull-right">
          <li><%= link_to "Home",    '#' %></li>
          <li><%= link_to "Help",    '#' %></li>
          <li><%= link_to "Sign in", '#' %></li>
        </ul>
      </nav>
    </div>
  </div>
</header>
{% endhighlight %}


知道怎么创建 partial 了，我们就来给网站加入底部吧。照规矩，这个底部 partial 就叫做 `_footer.html.erb`，也放在 layouts 目录中（[代码5.11](#list-5-11)）。[^7]

<p id="list-5-11"></p>**代码 5.11** 网站底部的 parial <br />`app/views/layouts/_footer.html.erb`

{% highlight erb %}
<footer class="footer">
  <small>
    <a href="http://railstutorial.org/">Rails Tutorial</a>
    by Michael Hartl
  </small>
  <nav>
    <ul>
      <li><%= link_to "About",   '#' %></li>
      <li><%= link_to "Contact", '#' %></li>
      <li><a href="http://news.railstutorial.org/">News</a></li>
    </ul>
  </nav>
</footer>
{% endhighlight %}

和头部一样，在底部我们也用了 `link_to` 创建了指向 “About”页面和 “Contact”页面的链接，地址还是用占位符代替。（`header` 和 `footer` 都是 HTML5 中新加入的标签）

渲染底部 partial 的方法和其他也是一样的（见[代码 5.12](#list-5-12)）

<p id="list-5-12"></p>**代码 5.12** 网站的布局，包含底部 partial <br />`app/views/layouts/application.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title><%= full_title(yield(:title)) %></title>
    <%= stylesheet_link_tag    "application", media: "all" %>
    <%= javascript_include_tag "application" %>
    <%= csrf_meta_tags %>
    <%= render 'layouts/shim' %>
  </head>
  <body>
    <%= render 'layouts/header' %>
    <div class="container">
      <%= yield %>
      <%= render 'layouts/footer' %>
    </div>
  </body>
</html>
{% endhighlight %}

当然，如果没有样式的话，底部还是很丑的（样式参见[代码 5.13](#list-5-13)）。效果见[图 5.7](#figure-5-7)。


<p id="list-5-13"></p>**代码 5.13** 添加底部所需的 CSS <br />`app/assets/stylesheets/custom.css.scss`

{% highlight scss %}
.
.
.

/* footer */

footer {
  margin-top: 45px;
  padding-top: 5px;
  border-top: 1px solid #eaeaea;
  color: #999;
}

footer a {
  color: #555;
}

footer a:hover {
  color: #222;
}

footer small {
  float: left;
}

footer ul {
  float: right;
  list-style: none;
}

footer ul li {
  float: left;
  margin-left: 10px;
}
{% endhighlight %}

<p id="figure-5-7"></p>![site_with_footer_bootstrap](assets/images/figures/site_with_footer_bootstrap.png)

图 5.7：添加底部后的“首页”（[/static_pages/home](http://localhost:3000/static_pages/home)）

<h2 id="sec-5-2">5.2 Sass 和 asset pipeline</h2>

asset pipeline 是 Rails 3.0 与之后版本之间最显著的区别之一，它可以明显提高像 CSS、JavaScript 和图片这样的静态资源的生成和管理效率。这节会概览一下 asset pipeline，并展示如何 Sass 这个工具来生成 CSS。

<h3 id="sec-5-2-1">5.2.1 Asset pipeline</h3>

为了实现新加入的 asset pipeline 功能，其实在 Rails 底层做了很多改变，不过对于 Rails 开发者来说，需要理解的只有三点： asset 目录，清单文件和预处理引擎。[^8]我们按顺序过一遍好了。

#### 资源目录

在 Rails 3.1 之前的版本中，静态资源分别存放在如下的 `public/` 目录中：

* `public/stylesheets`
* `public/javascripts`
* `public/images`

放在这些目录中的文件，通过像 http://example.com/stylesheets 这样的地址可以直接访问（Rails 3.0 之后的版本也可以）。

不过从 Rails 3.1 开始，标准的做法是将静态资源放在下面这三个目录中：

* `app/assets`：存放当前应用程序用到的资源文件
* `lib/assets`：存放开发团队自己开发的代码库用到的资源文件
* `vendor/assets`：存放第三方代码库用到的资源文件


你大概也想到了，上面的这些目录都有相对各种资源的子目录。比如：

{% highlight sh %}
$ ls app/assets/
images      javascripts stylesheets
{% endhighlight %}


这下我们就知道在 [5.1.2 节](#sec-5-1-2) 要把 `custom.css.scss` 放在 `app/assets/stysheets` 里的原因了：因为 `custom.css.scss` 是应用本身要用到的，所以，你懂的。

#### 清单文件

资源文件放对了地方之后，就可以通过清单文件来告诉 Rails（使用 [Sprockets](https://github.com/sstephenson/sprockets) gem）怎么把这些东西组合起来。（只对 CSS 和 JavaScript 起作用，不会包括图片）比方说，看下面这个默认的样式清单文件（[代码 5.14](#list-5-14)）

<strong id="list-5-14">代码 5.14</strong> 应用程序的 CSS 文件的清单文件 <br />`app/assets/stylesheets/application.css`

{% highlight css %}
/*
 * This is a manifest file that'll automatically include all the stylesheets
 * available in this directory and any sub-directories. You're free to add
 * application-wide styles to this file and they'll appear at the top of the
 * compiled file, but it's generally better to create a new file per style
 * scope.
 *= require_self
 *= require_tree .
*/
{% endhighlight %}

虽然这里只有几行 CSS 注释，不过 Sprockets 还是可以通过它夹杂相应的文件：

{% highlight css %}
/*
 * .
 * .
 * .
 *= require_self
 *= require_tree .
*/
{% endhighlight %}

看好，

{% highlight text %}
*= require_tree .
{% endhighlight %}

上面这行会把 `app/assets/stylesheets` 目录及其子目录中的所有 CSS 文件都引入进来。

下面这行：

{% highlight text %}
*= require_self
{% endhighlight %}

会确保 `application.css` 这个文件本身也能被加载进来。

Rails 默认的清单文件就很好用，所以我们不需要做任何修改。如果想进一步了解的话，[Rails Guides 中介绍 asset pipeline](http://guides.rubyonrails.org/asset_pipeline.html)的部分值得一看。

#### 预处理器引擎

搞定资源文件之后，Rails 会通过一些预处理引擎来处理，然后按照清单文件的设置将它们组合起来，再发送给浏览器。我们通过设置文件扩展名来告诉 Rails 究竟使用哪一个预处理引擎：最常用的三种扩展名分别是：Sass 的 `.scss`、 CoffeeScript 的`.coffee`和ERb的 `.erb`。ERb 和 Sass，我们在[3.3.3 节]和[5.2.2 节](#sec-5-2-2) 分别见过，而 最后会编译成 JavaScript 代码的 CoffeeScript 在本书里暂时还用不着（不过这种语言灰常优雅，[绝对值得一试](http://railscasts.com/episodes/267-coffeescript-basics)）

标识预处理引擎的扩展名可以连起来使用，比如下面这个就只会使用 CoffeeScript 处理

{% highlight text %}
foobar.js.coffee
{% endhighlight %}

而下面这个

{% highlight text %}
foobar.js.erb.coffee
{% endhighlight %}

则会使用 CoffeeScript 和 ERb 来处理（按扩展名从右向左处理，所以会先运行 CoffeeScript）

#### 在生产环境中的效率问题

Asset pipeline 带来的好处之一是它会自动在生产环境中优化资源文件。通常我们会把 CSS 和 JavaScript 按功能分成不同的文件村放，而且还会使用各种更便于阅读的格式，但是这只能给程序员带来方便，生产环境中这么做的效果很差；引入大量的文件会显著的拖慢网页加载（这是用户体验中最重要的一个影响因素）。有了 asset pipeline 之后，在生产环境下，所有的样式文件合并成一个，JavaScript 文件也一样，而像 `lib/assets` `vendor/assets` 里的文件则会通过删除不必要的空白符来见效文件体积。这样就两全其美了，程序员看到的是照惯例组织好的多个文件，生产环境中则优化成一个。

<h3 id="sec-5-2-2">5.2.2 句法强大的样式表</h3>

Sass 是一种在很多方面都超越了 CSS 的样式表编写语言。这节我们会介绍其中最重要的两个特点，嵌套和变量。（另一个是 mixin，会在 [7.1.1 节](chapter7.html#7-1-1)中介绍。）

[5.1.2 节](#sec-5-1-2)中介绍过，Sass 支持一种叫 SCSS 的格式（扩展名为 `.scss`），这是 CSS 的一个超集，也就是说， 任何 CSS 的语法在 SCSS 中都是有效的，SCSS 只是又添加了一部分特性而已。[^9] 在这个例子里，我们为了使用 Bootstrap，从一开始就用到了 SCSS。因为 Rails 的 asset pipeline 会自动对扩展名为 `.scss` 的文件使用 Sass 来处理，所以 `custom.css.scss` 会先被 Sass 预处理器处理，然后打包发送给浏览器。


#### 嵌套

样式表中经常会定义嵌套元素，比如在[代码 5.1](#list-5-1)中，定义了 `.center` 和  `.center h1` 两个样式：

{% highlight css %}
.center {
  text-align: center;
}

.center h1 {
  margin-bottom: 10px;
}
{% endhighlight %}

用 Sass 来改写之后

{% highlight scss %}
.center {
  text-align: center;
  h1 {
    margin-bottom: 10px;
  }
}
{% endhighlight %}

嵌套的 `h1` 会自动继承 `.center` 中的定义。

嵌套还有一种写法，语法稍有不同。在[代码 5.1](#list-5-7)中有这段

{% highlight css %}
#logo {
  float: left;
  margin-right: 10px;
  font-size: 1.7em;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: -1px;
  padding-top: 9px;
  font-weight: bold;
  line-height: 1;
}

#logo:hover {
  color: #fff;
  text-decoration: none;
}
{% endhighlight %}

其中 `#logo` 出现了了两次，一次是单独出现，另一次是标识 `hover` 属性时出现的（`hover` 是用来控制鼠标悬停于元素上时的样式）。要把第二个样式嵌套进第一个的话，就需要引用父级元素 `#logo`；在 SCSS 中，是用 `&` 符号来实现的：

{% highlight scss %}
#logo {
  float: left;
  margin-right: 10px;
  font-size: 1.7em;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: -1px;
  padding-top: 9px;
  font-weight: bold;
  line-height: 1;
  &:hover {
    color: #fff;
    text-decoration: none;
  }
}
{% endhighlight %}

Sass 在把 SCSS 转换成 CSS 的时候，会把 `&:hover` 编译成`#logo:hover`。

应用这两种方法来改写[代码 5.13](#list-5-13) 中关于底部的 CSS，结果如下：

{% highlight scss %}
footer {
  margin-top: 45px;
  padding-top: 5px;
  border-top: 1px solid #eaeaea;
  color: #999;
  a {
    color: #555;
    &:hover {
      color: #222;
    }
  }
  small {
    float: left;
  }
  ul {
    float: right;
    list-style: none;
    li {
      float: left;
      margin-left: 10px;
    }
  }
}
{% endhighlight %}

自己动手转换一下这段代码是个不错的练习，不过之后你最好验证一下这些 CSS 是不是还能正常运作。

#### 变量

在 Sass 中使用变量可以避免重复代码，也可以让代码更具表现力。比如在[代码 5.6](#list-5-6)和 [代码 5.13](#list-5-13) 中就有两段使用相同的颜色代码：

{% highlight scss %}
h2 {
  .
  .
  .
  color: #999;
}
.
.
.
footer {
  .
  .
  .
  color: #999;
}
{% endhighlight %}


`#999` 代表浅灰色，我们可以为它定义一个变量：

{% highlight scss %}
$lightGray: #999;
{% endhighlight %}

改完之后就是这样：

{% highlight scss %}
$lightGray: #999;
.
.
.
h2 {
  .
  .
  .
  color: $lightGray;
}
.
.
.
footer {
  .
  .
  .
  color: $lightGray;
}
{% endhighlight %}

因为像 `$lightGray` 这样的变量名明显要比 `#999` 这样的更具说明性，所以即使是为没有被重复使用的值定义变量也会很有帮助。Bootstrap 框架本身就定义了很多颜色变量，[这里能看到](http://bootstrapdocs.com/v2.0.4/docs/less.html)，这个页面里的变量定义是用的 LESS 语法，而不是 Sass， 不过没关系，bootstrap-sass 这个 gem为我们提供了相应的 Sass 形式的定义。LESS 用了 “at”符号 `@`，对应的 Sass 使用了美元符 `$`。在 Bootstrap 的变量页面我们可以看到为淡灰色定义的变量：

{% highlight less %}
@grayLight: #999;
{% endhighlight %}

也就是说，在 bootstrap-sass gem 中会有一个对应的 SCSS 变量 `$grayLight`。我们可以用它换掉我们自己定义的 `$lightGray` 变量：


{% highlight scss %}
h2 {
  .
  .
  .
  color: $grayLight;
}
.
.
.
footer {
  .
  .
  .
  color: $grayLight;
}
{% endhighlight %}


[代码5.15](#list-5-15)是使用嵌套和变量改写之后的完整 SCSS 文件。里面不光用到了 Sass 形式的颜色变量（就是参照 Bootstrap 中 LESS 形式转换的），也用到了内建的颜色代码（比如，`white` 代表 `#fff`）。特别要注意一下对 `footer` 标签样式的改进。

<strong id="list-5-15">代码 5.15</strong> 使用嵌套和变量改写后的 SCSS 文件 <br />`app/assets/stylesheets/custom.css.scss`

{% highlight scss %}
@import "bootstrap";

/* mixins, variables, etc. */

$grayMediumLight: #eaeaea;

/* universal */

html {
  overflow-y: scroll;
}

body {
  padding-top: 60px;
}

section {
  overflow: auto;
}

textarea {
  resize: vertical;
}

.center {
  text-align: center;
  h1 {
    margin-bottom: 10px;
  }
}

/* typography */

h1, h2, h3, h4, h5, h6 {
  line-height: 1;
}

h1 {
  font-size: 3em;
  letter-spacing: -2px;
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  font-size: 1.7em;
  letter-spacing: -1px;
  margin-bottom: 30px;
  text-align: center;
  font-weight: normal;
  color: $grayLight;
}

p {
  font-size: 1.1em;
  line-height: 1.7em;
}


/* header */

#logo {
  float: left;
  margin-right: 10px;
  font-size: 1.7em;
  color: white;
  text-transform: uppercase;
  letter-spacing: -1px;
  padding-top: 9px;
  font-weight: bold;
  line-height: 1;
  &:hover {
    color: white;
    text-decoration: none;
  }
}

/* footer */

footer {
  margin-top: 45px;
  padding-top: 5px;
  border-top: 1px solid $grayMediumLight;
  color: $grayLight;
  a {
    color: $gray;
    &:hover {
      color: $grayDarker;
    }
  }
  small {
    float: left;
  }
  ul {
    float: right;
    list-style: none;
    li {
      float: left;
      margin-left: 10px;
    }
  }
}
{% endhighlight %}

Sass 为我们提供了很多方式来简化样式表，[代码 5.15](#sec-5-15)中只用到了最主要的一部分，不过也算是开了个好头。更多功能请移步 [Sass 官网](http://sass-lang.com/)

<h2 id="sec-5-2"> 5.2 链接 </h1>

既然完成了网站的布局样式，也就该把之前用 `#` 占位符将就一下的链接设置好了。我们当然可以直接手写 HTML 代码：

{% highlight html %}
<a href="/static_pages/about">About</a>
{% endhighlight%}

不过这很明显不合 Rails 的路子。首先，地址改成 /about 肯定要比 /static_pages/about 要好；再者说，Rails 的惯例是使用命名路由，就像下面这样：

{% highlight erb %}
<%= link_to "About", about_path %>
{% endhighlight %}

这样的代码意思更明显，而且以后修改 about_path 的时候也可以更灵活。

我们之前计划的链接以及相应的地址和命名路由都在[表格 5.1](#table-5-1)里。除了最后那个，其他的在这章结束前我们都会实现。（最后那个会在[第 8 章](chapter8.html)实现）

<figure id="table-5-1">
 页面     |URI       |命名路由
:----------|:----------|:----------
Home   |/            |root_path
About   |/about  |about_path
Help     |/help     |help_path
Contact|/contact|contact_path
Sign up |/signup |signup_path
Sign in  |/signin  |signin_path
<figcaption>表格 5.1: 链接以及相对应的 URI 和路由</figcaption>
</figure>

继续下一步之前，我们先添加一个 Contact 页面（[第 3 章](chapter3.html)里作为联系留下的）。相对的测试代码见[代码 5.16](#list-5-16)，也是按照[代码 3.18](chapter3.html#list-3-18)的模式写的。注意一点，我们已经开始使用 Ruby 1.9 的哈希风格。

<strong id="list-5-16">代码 5.16</strong> Contact 页面的测试代码

{% highlight text %}
 spec/requests/static_pages_spec.rb 
{% endhighlight %}

{% highlight erb%}
require 'spec_helper'

describe "Static pages" do
  .
  .
  .
  describe "Contact page" do

    it "should have the h1 'Contact'" do
      visit '/static_pages/contact'
      page.should have_selector('h1', text: 'Contact')
    end

    it "should have the title 'Contact'" do
      visit '/static_pages/contact'
      page.should have_selector('title',
                    text: "Ruby on Rails Tutorial Sample App | Contact")
    end
  end
end
{% endhighlight %}

这部分代码的测试应当失败：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

我们需要写的应用代码和 About 页面的 [代码 3.2.2](chapter3.html#list-3-2-2) 差不多：首先修改路由（[代码 5.17](#list-5-17)），然后在 StaticPages controller 中添加 `contact` action（[代码 5.18](#list-5-18)），最后创建页面试图（[代码 5.19](#list-5-19)）

<strong id="list-5-17">代码 5.17</strong> 为 Contact 页面添加路由

{% highlight text %}
 config/routes.rb 
{% endhighlight %}

{% highlight erb %}
SampleApp::Application.routes.draw do
  get "static_pages/home"
  get "static_pages/help"
  get "static_pages/about"
  get "static_pages/contact"
  .
  .
  .
end
{% endhighlight %}

<strong id="list-5-18">代码 5.18</strong> 为 Contact 页面添加 action

{% highlight text %}
 app/controllers/static_pages_controller.rb 
{% endhighlight %}

{% highlight erb %}
class StaticPagesController < ApplicationController
  .
  .
  .
  def contact
  end
end
{% endhighlight %}

<strong id="list-5-19">代码 5.19</strong> 为 Contact 页面添加试图

% highlight text %}
 app/views/static_pages/contact.html.erb 
{% endhighlight %}

{% highlight erb %}
<% provide(:title, 'Contact') %>
<h1>Contact</h1>
<p>
  Contact Ruby on Rails Tutorial about the sample app at the
  <a href="http://railstutorial.org/contact">contact page</a>.
</p>
{% endhighlight %}

现在再运行测试就应该能通过了：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

<h3 id="sec-5-3-1">5.3.1 测试路由</h3> 

写完 static pages 的测试之后，路由的测试就很简单了：只需要把原始地址改成我们在 [表格 5.1](#table-5.1) 期望的命名路由就行。也就是说，把下面这个

{% highlight erb %}
visit '/static_pages/about'
{% endhighlight %}

改成这样

{% highlight erb %}
visit about_path
{% endhighlight %}

依次类推。完整代码见 [代码 5.20](#list-5-20)

<strong id="list-5-20">代码 5.20</strong> 命名路由的测试代码

{% highlight text %}
 spec/requests/static_pages_spec.rb 
{% endhighlight %}

{% highlight erb %}
require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the h1 'Sample App'" do
      visit root_path
      page.should have_selector('h1', text: 'Sample App')
    end

    it "should have the base title" do
      visit root_path
      page.should have_selector('title',
                        text: "Ruby on Rails Tutorial Sample App")
    end

    it "should not have a custom page title" do
      visit root_path
      page.should_not have_selector('title', text: '| Home')
    end
  end

  describe "Help page" do

    it "should have the h1 'Help'" do
      visit help_path
      page.should have_selector('h1', text: 'Help')
    end

    it "should have the title 'Help'" do
      visit help_path
      page.should have_selector('title',
                        text: "Ruby on Rails Tutorial Sample App | Help")
    end
  end

  describe "About page" do

    it "should have the h1 'About'" do
      visit about_path
      page.should have_selector('h1', text: 'About Us')
    end

    it "should have the title 'About Us'" do
      visit about_path
      page.should have_selector('title',
                    text: "Ruby on Rails Tutorial Sample App | About Us")
    end
  end

  describe "Contact page" do

    it "should have the h1 'Contact'" do
      visit contact_path
      page.should have_selector('h1', text: 'Contact')
    end

    it "should have the title 'Contact'" do
      visit contact_path
      page.should have_selector('title',
                    text: "Ruby on Rails Tutorial Sample App | Contact")
    end
  end
end
{% endhighlight %}

照旧，还是跑一遍测试，应该是没通过：

{%  highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

如果[代码 5.20](#list-5-20) 让你觉得裹脚布一样又臭又长，不要担心，我们会在 [5.3.4 节](#sec-5-3-4) 重构它的。

<h3 id="sec-5-3-2">5.3.2 Rails 路由</h3> 

URI 的测试写完了，就该想办法让测试通过了。[3.1.2 节](chapter3.html#sec-3-1-2) 里提过，Rails 里 URI 的配置文件是 `config/routes.rb`，如果你看过它的默认配置的话，肯定会觉得内容被无处不在的注释搞得一团糟，不过，这些注释还真的是很管用，通读之后对理解路由很有帮助。关于路由更深入的介绍在[Rails Guides](http://guides.rubyonrails.org/routing.html)。

定义命名路由，需要把下面这样的配置

{% highlight erb %}
get 'static_pages/help'
{% endhighlight %}

改成下面这样

{% highlight erb %}
match '/help', to: 'static_pages#help'
{% endhighlight %}

以后，不管是 `/help` 还是 `help_path` 都会返回正确的页面，也就是 `static_pages/help`。（实际上，之前用 `get` 定义的配置效果也是一样的，不过使用 `match` 更符合传统一点）

配置文件的全部内容见 [代码 5.21](#list-5-21)。我特意漏掉了 Home 页面，那部分会在 [代码 5.23](#list-5-23)里修改好。

<strong id="list-5-21">代码 5.21</strong> 静态页面的路由

{% highlight text %}
 config/routes.rb 
{% endhighlight %}

{% highlight erb %}
SampleApp::Application.routes.draw do
  match '/help',    to: 'static_pages#help'
  match '/about',   to: 'static_pages#about'
  match '/contact', to: 'static_pages#contact'
  .
  .
  .
end
{% endhighlight %}

仔细阅读上面这段代码，你大概就已经理解它的作用了。

{% highlight erb %}
match '/about', to: 'static_pages#about'
{% endhighlight %}

这面这行将 `/about` 匹配到了 StaticPages controller 的 `about` action。之前我们采用的是直接指定的办法：

{% highlight erb %}
get `static_pages/about`
{% endhighlight %}

虽然都能返回正确页面，但 `/about` 明显更简洁。我们之前也提过，`match '/about'` 会自动为 controller 和 view 创建命名路由：

{% highlight erb %}
about_path => '/about'
about_url  => 'http://localhost:3000/about'
{% endhighlight %}

注意到没有，`about_url` 实际上是一串完整的 URI 地址 http://localhost:3000/about （因为是本地环境，所以主域名是 localhost:3000，实际部署之后会变成 example.com 这样的）[5.3 节](#sec-5-3)里我们介绍过，要获取 /about，可以使用 `about_path`。本书里我们也会照惯例使用 `path` 格式，除非需要重定向，那时会用 `url` 格式的，这是因为，在处理重定向的时候，标准 HTTP 要求的是完整 URI 地址，不过现在大部分的浏览器，这两种情况都能处理。

再跑一遍测试，Hep、About 和 Contact 页面的相关测试应该可以通过了：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

只剩下我们特意漏掉的 Home 页面没通过测试。

添加以下代码：

{% highlight erb %}
match '/', to: 'static_pages#home'
{% endhighlight %}

其实没必要这么做，因为 Rails 提供了专门根路径 `/`构建方法，就在配置文件的最下方（[代码 5.22](#list-5-22)）。

<strong id="list-5-22">代码 5.22</strong> 如何定义根路径路由的注释

{% highlight text %}
config/routes.rb
{% endhighlight %}

{% highlight erb %}
SampleApp::Application.routes.draw do
  .
  .
  .
  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => "welcome#index"
  .
  .
  .
end
{% endhighlight %}

按上面的方法，改写一下，见 [代码 5.23](#list-5-23)。

<strong id="list-5-23">代码 5.23</strong> 添加根路径的路由

{% highlight erb %}
SampleApp::Application.routes.draw do
  root to: 'static_pages#home'

  match '/help',    to: 'static_pages#help'
  match '/about',   to: 'static_pages#about'
  match '/contact', to: 'static_pages#contact'  
  .
  .
  .
end
{% endhighlight %}

这样就把 根路径 / 匹配到了 /static_pages/home，而且还生成了相应的 URI 帮助方法：

{% highlight erb %}
Sroot_path => '/'
root_url  => 'http://localhost:3000/'
{% endhighlight %}

按照[代码 5.22](#list-5-22)的注释的建议，我们还应该删掉 `public/index.html`，预防在访问 / 的时候，Rails 直接渲染默认首页。你可以直接删除这个文件，不过如果你使用了 Git 的话，那么需要像下面这样才行：

{% highlight erb %}
$ git rm public/index.html
{% endhighlight %}

你可能想起来 [1.3.5 节](chapter1.html#sec-1-3-5) 里，我们用过一次 `git commit -a -m "Message" `命令，命令里用到了 `-a` 和 `-m` 来表示“包含全部修改”和“提交信息”。Git 允许我们用方便的写法 `git commit -am "Message"`，把两个修饰符组合在一起。

现在，所有的测试应该都能通过了：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

下面就该把这些链接塞进布局里了。

<h3 id="sec-5-3-3">5.3.3 命名路由</h3> 

要把链接塞进布局里，就要牵涉到 `link_to` 的第二个参数了，其实，只要改成相应的命名路由就好了。比如这样的：

{% highlight erb %}
<%= link_to "About", '#' %>
{% endhighlight %}

就得改成下面这样

{% highlight erb %}
<%= link_to "About", about_path %>
{% endhighlight %}

以此类推。

首先从 header 的 partial 开始好了，`_header.html.erb`（[代码 5.24](#list-5-24)）中包含到 Home 和 Help 页面的链接。另外，照惯例我们还会为 LOGO 添加上去 Home 页面的链接。

<strong id="list-5-24">代码 5.24</strong> Header partial 中的链接

{% highlight text %}
 app/views/layouts/_header.html.erb 
{% endhighlight %}

{% highlight erb %}
<header class="navbar navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container">
      <%= link_to "sample app", root_path, id: "logo" %>
      <nav>
        <ul class="nav pull-right">
          <li><%= link_to "Home",    root_path %></li>
          <li><%= link_to "Help",    help_path %></li>
          <li><%= link_to "Sign in", '#' %></li>
        </ul>
      </nav>
    </div>
  </div>
</header>
{% endhighlight %}

暂时还没有 “Sign in”链接的命名路由，[第 8 章](chapter8.html)的时候会做，现在嘛，还是先用 “#”占位符将就一下。

接下来就是 footer partial 里的链接了， `_footer.html.erb`，里面有 About 和 Contact 页面（[代码 5.25](#list-5-25)）

{% highlight text %}
 app/views/layouts/_footer.html.erb 
{% endhighlight %}

{% highlight erb %}
<footer class="footer">
  <small>
    <a href="http://railstutorial.org/">Rails Tutorial</a>
    by Michael Hartl
  </small>
  <nav>
    <ul>
      <li><%= link_to "About",   about_path %></li>
      <li><%= link_to "Contact", contact_path %></li>
      <li><a href="http://news.railstutorial.org/">News</a></li>
    </ul>
  </nav>
</footer>
{% endhighlight %}

这样，在[第 3 章](chapter3.html)我们创建的静态页面，以及连接到它们的链接就都搞定了。比如说， [/about](http://localhost:3000/about) 会链接到 About 页面（[图 5.8](#figure-5-8)）。

其实上面做的这些都没太大用处，虽然还没测试过布局中的链接是否有效，但是可以肯定的是，如果没有定义这些路由的话，测试肯定会失败。你可以试一试，把[代码 5.21](#list-5-21)中的路由定义全部注释掉，然后跑一遍测试。有一个测试方法可以确保所有的链接都有效，详情见[5.6 节](#sec-5-6)。

<figure id="#figure-5-8">
![about_page_styled](assets/images/figures/about_page_styled.png)
<figcaption> [/about](http://localhost:3000/about) 上的 About 页面
</figcaption>
</figure>

<h3 id="sec-5-3-4">5.3.4 漂亮的 RSpec</h3>

在[5.3.1 节](#sec-5-3-1)就说了现在的测试代码丑到不忍直视，参见（[代码 5.20](#list-5-20)）。所以这节的任务就是，用 RSpec 的最后一个特性，让测试代码更紧凑更优雅。

看一下原来的代码，究竟有哪些部分是可以改进的：

{% highlight erb %}
describe "Home page" do

  it "should have the h1 'Sample App'" do
    visit root_path
    page.should have_selector('h1', text: 'Sample App')
  end

  it "should have the base title" do
    visit root_path
    page.should have_selector('title',
                      text: "Ruby on Rails Tutorial Sample App")
  end

  it "should not have a custom page title" do
    visit root_path
    page.should_not have_selector('title', text: '| Home')
  end
end
{% endhighlight %}

上面的每一个测试都包含了一个访问 root 路径的部分，重复的代码需要消灭，这里就要用到 `before` 代码块：

{% highlight erb %}
describe "Home page" do
  before { visit root_path } 

  it "should have the h1 'Sample App'" do
    page.should have_selector('h1', text: 'Sample App')
  end

  it "should have the base title" do
    page.should have_selector('title',
                      text: "Ruby on Rails Tutorial Sample App")
  end

  it "should not have a custom page title" do
    page.should_not have_selector('title', text: '| Home')
  end
end
{% endhighlight %}

这行代码

{% highlight erb %}
before { visit root_path }
{% endhighlight %}

作用是在每次测试前，都会访问 root 路径。（`before` 方法还可以通过 `before(:each)` 来调用）

另外就是，每个测试都有这部分

{% highlight erb %}
it "should have the h1 'Sample App'" do
{% endhighlight %}

和这部分

{% highlight erb %}
page.should have_selector('h1', text: 'Sample App')
{% endhighlight %}

基本都是一样的东西。另外，每个测试都会引用 `page` 变量。可以通过使用 `subject` 来告诉 RSpec，`page` 是每个测试都要用到的物件

{% highlight erb %}
subject { page }
{% endhighlight %}

然后再使用一个 it 方法的变体来把代码压缩到一行里：

{% highlight erb %}
it { should have_selector('h1', text: 'Sample App') }
{% endhighlight %}

因为因为 Capybara [3.2.1 节](chapter3.html#sec-3-2-1) 提供的方法，在使用了 `subject { page }` 之后，测试中 `should` 将会自动调用 `page` 变量。

修改之后的 Home 页面的测试代码如下

{% highlight erb %}
subject { page }

  describe "Home page" do
    before { visit root_path } 

    it { should have_selector('h1', text: 'Sample App') }
    it { should have_selector 'title',
                        text: "Ruby on Rails Tutorial Sample App" }
    it { should_not have_selector 'title', text: '| Home' }
  end
{% endhighlight %}

上面的代码看起来舒服多了，不过 title 部分的测试还是有一点长。[代码 5.20](#list-5-20) 中的 title 测试中的文本部分都是这样的：

{% highlight erb %}
"Ruby on Rails Tutorial Sample App | About"
{% endhighlight %}

[3.5 节](chapter3.html#sec-3-5)的练习中，建议通过定义一个 `base_title` 并使用字符串内插[代码 3.30](chapter3.html#list-3-30)，消灭一部分重复代码。不过我们可以干的更好，只要定义一个 `full_title`，对，没记错，就是 [代码 4.2](chapter4.html#list-4-2) 里的那个。只不过，这个帮助方法是定义在新建的 `spec/support` 目录下的 `utilities.rb` 里（[代码 5.26](#list-5-26)）。

<strong id="list-5-26">代码 5.26</strong> 

`spec/support/utilities.rb`

{% highlight erb %}
def full_title(page_title)
  base_title = "Ruby on Rails Tutorial Sample App"
  if page_title.empty?
    base_title
  else
    "#{base_title} | #{page_title}"
  end
end
{% endhighlight %}

基本上，就是复制了[代码 4.2](chapter4.html#list-4-2) 里的那个帮助方法。有两个方法可以避免我们在输入 base title 的时候打错字，这种设计看上去不是很可靠，但是明显更先进，就是测试的时候，直接测试 ` full_title`这个帮助方法，[5.6 节](#sec-5-6)里你会看到这个练习的。

` spec/supprot` 目录下的文件都会被 RSpec 自动夹在，也就是说，Home 页面的测试我们可以这么写：

{% highlight erb %}
 subject { page }

  describe "Home page" do
    before { visit root_path } 

    it { should have_selector('h1',    text: 'Sample App') }
    it { should have_selector('title', text: full_title('')) }
  end
{% endhighlight %}

同样的方法，也可以用来简化 Help、 About 和 Contact 页面的测试代码了。简化之后的完整代码见[代码 5.27](#list-5-27)。

<strong id="list-5-27">代码 5.27</strong> 更高更快更强的静态页面测试

` spec/requests/static_pages_spec.rb `

{% highlight erb %}
 require 'spec_helper'

describe "Static pages" do

  subject { page }

  describe "Home page" do
    before { visit root_path }

    it { should have_selector('h1',    text: 'Sample App') }
    it { should have_selector('title', text: full_title('')) }
    it { should_not have_selector 'title', text: '| Home' }
  end

  describe "Help page" do
    before { visit help_path }

    it { should have_selector('h1',    text: 'Help') }
    it { should have_selector('title', text: full_title('Help')) }
  end

  describe "About page" do
    before { visit about_path }

    it { should have_selector('h1',    text: 'About') }
    it { should have_selector('title', text: full_title('About Us')) }
  end

  describe "Contact page" do
    before { visit contact_path }

    it { should have_selector('h1',    text: 'Contact') }
    it { should have_selector('title', text: full_title('Contact')) }
  end
end
{% endhighlight %}

修改完之后，测试应该也是可以通过的：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

[代码 5.27](#list-5-27) 的 RSpec 看起来要比 [代码 5.20](#list-5-20) 里的简洁多了，其实，我们还能继续精简（[5.6 节](#sec-5-6)）。后面我们会一直用这种简洁的风格来开发应用的剩余部分。

<h2 id="sec-5-4"> 5.4 用户注册 第一部分 </h2>

这章我们会以完成用户注册页面的路由来做结尾，也就是说，要創建第二个 controller 了。这第一步，对于实现用户注册功能是至关重要的，至于下面的，我们会在第六章和第七章完成。

<h3 id="sec-5-4-1"> 5.4.1 用户 controller </h3>

StaticPages 之后，我们就没怎么碰过 controller 了，现在是时候创建第二个，Users controller 了。和之前一样，我们还是会用 `generate` 来生成最简单的 controller，暂时只需要一个新用户注册的页面。按照 Rails 喜欢的 [REST 结构](http://en.wikipedia.org/wiki/Representational_State_Transfer)，新用户注册对应的 action，我们应当将它命名为 `new`，然后作为参数传递给 `generate controller`（[代码 5.28](#list-5-28)）。

<strong id="list-5-28"> 代码 5.28 </strong> 生成 Users controller

{% highlight sh %}
$ rails generate controller Users new --no-test-framework
      create  app/controllers/users_controller.rb
       route  get "users/new"
      invoke  erb
      create    app/views/users
      create    app/views/users/new.html.erb
      invoke  helper
      create    app/helpers/users_helper.rb
      invoke  assets
      invoke    coffee
      create      app/assets/javascripts/users.js.coffee
      invoke    scss
      create      app/assets/stylesheets/users.css.scss
{% endhighlight %}

这样就生成了包含一个 `new` action 的 Users controller （[代码 5.29](#list-5-29)）以及一个新用户注册页面的 view （[代码 5.30](#list-5-30)）。

<strong id="list-5-29"> 代码 5.29 </strong> 初始状态的 Users controler

` app/controllers/users_controller.rb `

{% highlight erb %}
class UsersController < ApplicationController
  def new
  end

end
{% endhighlight %}

<strong id="list-5-30"> 代码 5.30 </strong> 初始状态的 新用户注册页面的 view

` app/views/users/new.html.erb `

{% highlight erb %}
<h1>Users#new</h1>
<p>Find me in app/views/users/new.html.erb</p>
{% endhighlight %}

<h3 id="sec-5-4-2"> 5.4.2 Signup URI </h3>

上一节里面，我们已经完成了 /users/new 上的页面，不过按照[表格 5.1](#table-5-1)的模式，注册的 URI 应该是 /signup。老规矩，还是先写测试：

{% highlight sh %}
$ rails generate integration_test user_pages
{% endhighlight %}

然后按照[代码 5.27]的路数，先给测试里的 `h1` `title` 标签加上内容 （[代码 5.31](#list-5-31)）

<strong id="list-5-31"> 代码 5.31 </strong> 

` spec/requests/user_pages_spec.rb `

{% highlight erb %}
require 'spec_helper'

describe "User pages" do

  subject { page }

  describe "signup page" do
    before { visit signup_path }

    it { should have_selector('h1',    text: 'Sign up') }
    it { should have_selector('title', text: full_title('Sign up')) }
  end
end
{% endhighlight %}

先跑一遍测试：

{% highlight sh %}
$ bundle exec rspec spec/requests/user_pages_spec.rb
{% endhighlight %}

虽然没什么用处，不过其实，测试命令里我们可以把整个目录都作为参数传进去：

{% highlight sh %}
$ bundle exec rspec spec/requests/
{% endhighlight %}

还可以更进一步，把所有的测试都传进去：

{% highlight sh %}
$ bundle exec rspec spec/
{% endhighlight %}

为了测试的完整性，后面的测试我都会用这个方法来跑。顺便一说，虽然还是没什么大用的，但你可能看别人这么用过，你可以直接用 Rake 来跑 `spec`：

{% highlight sh %}
$ bundle exec rake spec
{% endhighlight %}

（实际上，你可以直接输入`rake`；因为 `rake` 的默认动作就是跑测试。。。）

根据错提示，因为 Users controller 已经有 `new` action，所以，要让测试通过，我们只需要创建正确的路由和试图内容。照着 [代码 5.21](#list-5-21)的做法，添加 `match '/signup'`（[代码 5.32](#list-5-32)）

<strong id="list-5-32"> 代码 5.32 </strong>  注册页面的路由

`config/routes.rb`

{% highlight erb %}
SampleApp::Application.routes.draw do
  get "users/new"

  root to: 'static_pages#home'

  match '/signup',  to: 'users#new'

  match '/help',    to: 'static_pages#help'
  match '/about',   to: 'static_pages#about'
  match '/contact', to: 'static_pages#contact'
  .
  .
  .
end
{% endhighlight %}

注意，我们保留了自动生成的 `get "users/new"`。虽然不符合 REST，但是目前这条配置能确保 `users/new` 路由正常工作。我们会在 [7.1.2 节](chapter7.html#sec-7-1-2)中消灭它。

现在，只需要给 view 添加 title 和 “Sign up”标题了（[代码 5.33](#list-5-33)）。

<strong id="list-5-33"> 代码 5.33 </strong>  修改后的注册页面

` app/views/users/new.html.erb `

{% highlight erb %} 
<% provide(:title, 'Sign up') %>
<h1>Sign up</h1>
<p>Find me in app/views/users/new.html.erb</p>
{% endhighlight %}

这样注册页面的测试就能通过了。接着就该给 Home 页面里的注册按钮填上正确的链接地址了。和其他的路由一样，`match '/signup'` 给我们提供了 `signup_path` 这个命名路由，在[代码 5.34](#list-5-34)里会用到。

<strong id="list-5-34"> 代码 5.34 </strong> 链接到 Signup 页面的按钮

` app/views/static_pages/home.html.erb `

{% highlight erb %} 
<div class="center hero-unit">
  <h1>Welcome to the Sample App</h1>

  <h2>
    This is the home page for the
    <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
    sample application.
  </h2>

  <%= link_to "Sign up now!", signup_path, class: "btn btn-large btn-primary" %>
</div>

<%= link_to image_tag("rails.png", alt: "Rails"), 'http://rubyonrails.org/' %>
{% endhighlight %}

这样，链接和路由就全都搞定了，至少在[第 8 章](chapter8.html)我们添加登陆路由之前，一切都不会有问题。新用户注册页面 （/signup）的样子见[图 5.9](#figure-5-9)。

<figure id="figure-5-9">
![new_signup_page_bootstrap](assets/images/figures/new_signup_page_bootstrap.png )
<figcaption>图 5.9： [/signup](http://localhost:3000/signup)上的注册页面</figcaption>
</figure>

最后测试一下，肯定通过了：

{% highlight sh %} 
$ bundle exec rspec spec/
{% endhighlight %}

<h2 id="5.5"> 5.5 </h2> 小节

这节我们主要是在打磨应用的布局和路由，本书剩下的部分，基本上就是在充实这个应用了：首先，实现用户注册、登陆、注销；其次，实现用户发推功能；最后，实现关注其他用户功能。

如果你使用 Git 来做版本惯例的，现在应该把分支上的改变合并到主分支上去了：

{% highlight sh %} 
$ git add .
$ git commit -m "Finish layout and routes"
$ git checkout master
$ git merge filling-in-layout
{% endhighlight %}

也可以推送到 GitHub去：

{% highlight sh %} 
$ git push
{% endhighlight %}

最后，你就可以部署到 Heroku 上了：

{% highlight sh %} 
$ git push heroku
{% endhighlight %}

成果可以这样看到：

{% highlight sh %} 
$ heroku open
{% endhighlight %}

如果有问题，查看 Heroku 的日志文件来除错：

{% highlight sh %} 
$ heroku logs
{% endhighlight %}

<h2 id="sec-5-6"> 5.6 练习</h2>

1. [代码 5.27](#list-5-27)中静态页面的测试代码虽然已经很简洁，但还是稍微有那么一丢丢的罗嗦。RSpec 提供了一个叫做 shared examples 的工具来消除重复代码，按照 [代码 5.35](#list-5-35)的例子，继续精简 Help、About 和 Contact 页面的测试代码。注意， [代码 3.30](#list-3-30) 里介绍过的 `let` 命令，可以按照要求创建一个本地变量，与实例变量相比，本地变量实在赋值后创建的。

2. 你大概也注意到了，我们对链接的测试其实只是测试了路由，而并没有真的去检查链接是否能够正确的访问。要实现这个测试，需要用到 RSpec 内置的`visit` 和 `click_link`。补全[代码 5.36](#list-5-36)来检查这些链接是否正确。

3. 要清除对 [代码 5.26](#list-5-26)里的 `full_title` 帮助方法的一览，就必须创建自身的帮助方法，见[代码 5.37](#list-5-37)。（你需要创建 `spec/helpers` 目录和 `application_helper_spec.rb`文件），然后使用[代码 5.38](#list-5-38)中的代码将它 `include` 进来。然后跑一遍测试来检查新加入的代码是否能正确运作。注意，[代码 5.37](#list-5-37)使用了正则表达式，这个我们会在 [6.2.4 节](#list-6-2-4)学到。

<strong id="list-5-35"> 代码 5.35 </strong>使用 RSpec 的 shared example 来消除重复的测试代码

` spec/requests/static_pages_spec.rb `

{% highlight erb %} 
require 'spec_helper'

describe "Static pages" do

  subject { page }

  shared_examples_for "all static pages" do
    it { should have_selector('h1',    text: heading) }
    it { should have_selector('title', text: full_title(page_title)) }
  end

  describe "Home page" do
    before { visit root_path }
    let(:heading)    { 'Sample App' }
    let(:page_title) { '' }

    it_should_behave_like "all static pages"
    it { should_not have_selector 'title', text: '| Home' }
  end

  describe "Help page" do
    .
    .
    .
  end

  describe "About page" do
    .
    .
    .
  end

  describe "Contact page" do
    .
    .
    .
  end
end
{% endhighlight %}

<strong id="list-5-36"> 代码 5.36 </strong> 链接的测试

`spec/requests/static_pages_spec.rb`

{% highlight erb %} 
require 'spec_helper'

describe "Static pages" do
  .
  .
  .
  it "should have the right links on the layout" do
    visit root_path
    click_link "About"
    page.should have_selector 'title', text: full_title('About Us')
    click_link "Help"
    page.should # fill in
    click_link "Contact"
    page.should # fill in
    click_link "Home"
    click_link "Sign up now!"
    page.should # fill in
    click_link "sample app"
    page.should # fill in
  end
end
{% endhighlight %}

<strong id="list-5-37"> 代码 5.37 </strong>

` spec/helpers/application_helper_spec.rb `

{% highlight erb %} 
require 'spec_helper'

describe ApplicationHelper do

  describe "full_title" do
    it "should include the page title" do
      full_title("foo").should =~ /foo/
    end

    it "should include the base title" do
      full_title("foo").should =~ /^Ruby on Rails Tutorial Sample App/
    end

    it "should not include a bar for the home page" do
      full_title("").should_not =~ /\|/
    end
  end
end
{% endhighlight %}

<strong id="list-5-38"> 代码 5.38 </strong>

`spec/support/utilities.rb`

{% highlight erb %}
include ApplicationHelper
{% endhighlight %}

<div class="navigation">
  <a class="prev_page" href="chapter4.html">&laquo; 第四章 Rails 背后的 Ruby</a>
  <a class="next_page" href="chapter6.html">第六章 Modeling users &raquo;</a>
</div>

------------------------------------

[^1]: 感谢读者 [Colm Tuite](https://twitter.com/colmtuite)将 Bootstrap 转换到我们的示例程序上。
[^2]: 本书中的所有构思图都是通过 [Mockingbird](http://gomockingbird.com/)这个在线应用制作的。
[^3]: 这些 class 和 Ruby 的类一点关系都没有。
[^4]: 你大概注意到了 `img` 这个标签的格式，不是 <img>...</img> 而是 <img ... />。这样的标签叫做自关闭标签。
[^5]: 在 asset pipeline 中使用 LESS 当然也是可以的，详情见 [less-rails-bootstrap gem](http://rubygems.org/gems/less-rails-bootstrap)
[^6]: 很多 Rails 程序员都会使用一个 `shared` 目录来存放需要在不同的 view 中分享使用的 partial。我倾向于在 `shared` 目录中存在功能性的 partial，而把那些每个页面都会用到的 partial 放在`layouts` 目录中。 （我们会在[第 7 章](chapter7.html)创建 `shared` 目录）这样的分割在我看来才比较符合逻辑，不过，把它们都放在 `shared` 目录里对正常运作没有影响。
[^7]: 你可能想知道为什么使用了 `footer` 标签和 `.footer` class。理由就是，这样的标签对于人类来说更容易理解，而那个 class 是因为 Bootstrap 里在用，所以不得不用。愿意的话，用 `div` 标签来代替 `footer` 也没什么问题。
[^8]: 这节是按照[这篇博客](http://2beards.net/2011/11/the-rails-3-asset-pipeline-in-about-5-minutes/)架构的。更深入的东西，去[the Rails Guide on the Asset Pipeline](http://guides.rubyonrails.org/asset_pipeline.html)看。
[^9]: Sass 仍然支持较早的 `.sass` 格式，这个格式相对来说更简洁，花括号更少，但是对现存项目不太友好，已经熟悉 CSS 的人的学习难度也相对更大。
