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

在示例程序中加入连接和样式的第一步，我们要修改布局文件 `application.html.erb`（上次使用是在代码 4.3 中），添加一些 HTML 结构。我们要添加一些区域，一些 CSS class，以及网站导航。布局文件的内容参见代码 5.1，对各部分代码的说明紧跟其后。如果你迫不及待的想看到结果，请查看图 5.2。（注意：结果（还）不是很让人满意。）
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

我们从上往下看一下代码 5.1 中新添加的元素。[3.1 节](chapter3.html#sec-3-1)简单的介绍过，Rails 3 默认会使用 HTML5（如 `<!DOCTYPE html>` 所示），因为 HTML5 标准还很新，有些浏览器（特别是较旧版本的 IE 浏览器）还没有完全支持，所以我们加载了一些 JavaScript 代码（称作“[HTML5 shim](http://code.google.com/p/html5shim/)”）来解决这个问题：
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

虽然代码 5.1 中的布局达到了目的，但它的内容看起来有点混乱。HTML shim 就占用了三行，而且使用了只针对 IE 的奇怪句法，所以如果能把它打包放在一个单独的地方就好了。头部的 HTML 自成了一个逻辑单元，所以可以把这部分也打包放在某个地方。我们在 Rails 中可以使用局部视图来实现这种想法。先来看一下定义了局部视图之后的布局文件（参见代码 5.8）。
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

当然，若要局部视图起作用，我们要写入相应的内容。本例中的 HTML shim 局部视图只包含三行代码，如代码 5.9 所示。
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

按照 HTML shim 和头部局部视图采用的方式，我们也可以在布局视图中渲染底部局部视图。（参见代码 5.12。）
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

<h3 id="sec-5-3-1">5.3.1</h3> 测试路由

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

<h3 id="sec-5-3-2">5.3.2</h3> Rails 路由







------------------------------------
[^1]:
[^2]:
[^3]:
[^4]:
[^5]:
[^6]:
[^7]:
[^8]:
[^9]:
