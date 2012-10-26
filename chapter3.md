---
layout: chapter
title: 第三章 基本静态的页面
---

从本章开始我们要开发一个大型的示例程序，本书后续内容都会基于这个示例程序。最终完成的程序会包含用户、微博功能，以及完成的登录和用户验证系统，不过我们会从一个看似功能有限的话题出发——创建静态页面。这看似简单的一件事却是一个很好的锻炼，极具意义，对这个初建的程序而言也是个很好的开端。

虽然 Rails 是被设计用来开发基于数据库的动态网站的，不过它也能胜任使用纯 HTML 创建的静态页面。其实，使用 Rails 创建动态页面还有一点好处：我们可以方便的添加一小部分动态内容。这一章就会教你怎么做。在这个过程中我们还会一窥自动化测试（automated testing）的面目，自动化测试可以让我们确信自己编写的代码是正确的。而且，编写一个好的测试用例还可以让我们信心十足的重构（refactor）代码，修改实现过程但不影响最终效果。

本章有很多的代码，特别是在 [3.2 节](#sec-3-2)和[3.3 节](#sec-3-3)，如果你是 Ruby 初学者先不用担心没有理解这些代码。就像在 [1.1.1 节](chapter1.html#sec-1-1-1)中说过的，你可以直接复制粘贴测试代码，用来验证程序中代码的正确性而不用担心其工作原理。[第四章](chapter4.html)会更详细的介绍 Ruby，你有的是机会来理解这些代码。还有 RSpec 测试，它在本书中会被反复使用，如果你现在有点卡住了，我建议你硬着头皮往下看，几章过后你就会惊奇地发现，原本看起来很费解的代码现在已经很容易理解了。

类似第二章，在开始之前我们要先创建一个新的 Rails 项目，这里我们叫它 `sample_app`：

{% highlight sh %}
$ cd ~/rails_projects
$ rails new sample_app --skip-test-unit
$ cd sample_app
{% endhighlight %}

上面代码中传递给 `rails` 命令的 `--skip-test-unit` 选项的意思是让 Rails 不生成默认使用的 `Test::Unit` 测试框架对应的 `test` 文件夹。这样做并不是说我们不用写测试，而是从 [3.2 节](#sec-3-2)开始我们会使用另一个测试框架 RSpec 来写整个的测试用例。

类似 [2.1 节](chapter2.html#sec-2-1)，接下来我们要用文本编辑器打开并编辑 `Gemfile`，写入程序所需的 gem。这个示例成粗会用到之前没用过的两个 gem：RSpec 所需的 gem 和针对 Rails 的 RSPec 库 gem。代码 3.1 所示的代码会包含这些 gem。（注意：如果此时你想安装这个示例程序所需的所有 gem，你应该使用代码 9.49 中的代码。）

**代码 3.1** 示例程序的 `Gemfile`

{% highlight ruby %}
source 'https://rubygems.org'

gem 'rails', '3.2.8'

group :development, :test do
  gem 'sqlite3', '1.3.5'
  gem 'rspec-rails', '2.11.0'
end

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '3.2.5'
  gem 'coffee-rails', '3.2.2'
  gem 'uglifier', '1.2.3'
end

gem 'jquery-rails', '2.0.2'

group :test do
  gem 'capybara', '1.1.2'
end

group :production do
  gem 'pg', '0.12.2'
end
{% endhighlight %}

上面的代码将 `rspec-rails` 放在了开发组中，这样我们就可以使用 RSpec 相关的生成器了，同样我们还把它放到了测试组中，这样才能在测试时使用它。我们没必要单独的安装 RSpec，因为它是 rspec-rails 的依赖件（dependency），会被自动安装。我们还加入了 [Capybara](https://github.com/jnicklas/capybara)，这个 gem允许我们使用类似英语中的句法编写模拟和应用程序交互的代码。<sup>[1](#fn-1)</sup> 和[第二章](chapter2.html)一样，我们还要把 PostgreSQL 所需的 gem 加入生产组，这样才能部署到 Heroku：

{% highlight ruby %}
group :production do
  gem 'pg', '0.12.2'
end
{% endhighlight %}

Heroku 建议在开发环境和生产环境使用不同的数据库，不过对我们的示例程序而言没什么影响，SQLite 比 PostgreSQL 更容易安装和配置。在你的电脑中安装和配置 PostgreSQL 会作为一个练习。（参见 [3.5 节](#sec-3-5)）

安装和包含这些新加的 gem，运行 `bundle install`：

{% highlight sh %}
$ bundle install --without production
{% endhighlight %}

和第二章一样，我们使用 `-without production` 禁止安装生产环境所需的 gem。这个选项会被记住，所以后续调用 Bundler 就不用再指定这个选项，直接运行 `bundle install` 就可以了。<sup>[2](#fn-2)</sup>

接着我们要设置一下让 Rails 使用 RSpec 而不用 `Test::Unit`。这个设置可以通过 `rails generate rspec:install` 命令实现：

{% highlight sh %}
$ rails generate rspec:install
{% endhighlight %}

如果系统提示缺少 JavaScript 运行时，你可以访问 [execjs 在 GitHub 的页面](https://github.com/sstephenson/execjs)查看可以使用的运行时。 我一般都建议安装 [Node.js](http://nodejs.org/)。

然后剩下的就是初始化 Git 仓库了：<sup>[3](#fn-3)</sup>

{% highlight sh %}
$ git init
$ git add .
$ git commit -m "Initial commit"
{% endhighlight %}

和第一个程序一样，我建议你更新一下 `README` 文件，能够更好的描述这个程序，还可以提供一些帮助信息，可参照代码 3.2。

**代码 3.2** 示例程序改善后的 `README` 文件

{% highlight markdown %}
# Ruby on Rails Tutorial: sample application

This is the sample application for
[*Ruby on Rails Tutorial: Learn Rails by Example*](http://railstutorial.org/)
by [Michael Hartl](http://michaelhartl.com/).
{% endhighlight %}

然后添加 `.md` 后缀将其更改为 Markdown 格式，再提交所做的修改：

{% highlight sh %}
$ git mv README.rdoc README.md
$ git commit -a -m "Improve the README"
{% endhighlight %}

![create_repository_new](assets/images/figures/create_repository_new.png)

图 3.1：为示例程序在 GitHub 新建一个仓库

这个程序在本书的后续章节会一直使用，所以建议你在 GitHub 新建一个仓库（如图 3.1），让后将代码推动上去：

{% highlight sh %}
$ git remote add origin git@github.com:<username>/sample_app.git
$ git push -u origin master
{% endhighlight %}

我自己也做了这一步，你可以在 GitHub 上找到[这个示例程序的代码](https://github.com/railstutorial/sample_app_2nd_ed)。（我用了一个稍微不同的名字）

当然我们也可以选择在这个早期阶段将程序部署到 Heroku：

{% highlight sh %}
$ heroku create --stack cedar
$ git push heroku master
{% endhighlight %}

在阅读本书的过程中，我建议你经常地推送并部署这个程序：

{% highlight sh %}
$ git push
$ git push heroku
{% endhighlight %}

这样你可在远端做个备份，也可以尽早的获知生成环境中出现的错误。如果你在 Heroku 遇到了问题，可以看一下生成环境的日志文件尝试解决这些问题：

{% highlight sh %}
$ heroku logs
{% endhighlight %}

所有的准备工作都结束了，下面要开始开发这个示例程序了。

<h2 id="sec-3-1">3.1 静态页面</h2>

Rails 中有两种方式创建静态页面。其一，Rails 可以处理真正只包含 HTML 代码的静态页面。其二，Rails 允许我们定义包含纯 HTML 的视图，Rails 会对其进行渲染，然后 Web 服务器会将结果返回浏览器。

现在回想一下 [1.2.3 节](chapter1.html#sec-1-2-3) 中讲过的 Rails 目录结构（图 1.2）会对我们有点帮助。本节主要的工作都在 `app/controllers` 和 `app/views` 文件夹中。（[3.2 节](#sec-3-2)中我们还会新建一个文件夹）

在这节你会第一次发现在文本编辑器或 IDE 中打开整个 Rails 目录是多么有用。不过怎么做却取决于你的系统，大多数情况下你可以在命令行中用你选择的浏览器命令打开当前应用程序所在的目录，在 Unix 中当前目录就是一个点号（`.`）：

{% highlight sh %}
$ cd ~/rails_projects/sample_app
$ <editor name> .
{% endhighlight %}

例如，用 Sublime Text 打开示例程序，你可以输入：

{% highlight sh %}
$ subl .
{% endhighlight %}

对于 Vim 来说，针对你使用的不同变种，你可以输入 `vim .`、`gvim .` 或 `mvim .`。

<h3 id="sec-3-1-1">3.1.1 真正的静态页面</h3>

我们先来看一下真正静态的页面。回想一下 [1.2.5 节](chapter1.html#sec-1-2-5)，每个 Rails 应用程序执行过 `rails` 命令后都会生成一个小型的可以运行的程序，默认的欢迎页面的地址是 <http://localhost:3000/>（图 1.3）。

![public_index_rails_3](assets/images/figures/public_index_rails_3.png)

图 3.2：`public/index.html` 文件

如果想知道这个页面是怎么来的，请看一下 `public/index.html` 文件（如图 3.2）。因为文件中包含了一下样式信息，所以看起来有点乱，不过其效果却达到了：默认情况下 Rails 会直接将 `public` 目录下的文件发送给浏览器。<sup>[5](#fn-5)</sup> 对于特殊的 `index.html` 文件，你不用在 URI 中指定它，因为它是默认显示的文件。如果你想在 URI 中包含这个文件的名字也可以，不过 http://localhost:3000/ 和 http://localhost:3000/index.html 的效果是一样的。

如你所想的，如果你需要的话也可以创建静态的 HTML 文件，并将其放在和 `index.html` 相同的目录 `public` 中。举个例子，我们要创建一个文件显示一个友好的欢迎信息（参见代码 3.3）：<sup>[6](#fn-6)</sup>

{% highlight sh %}
$ subl public/hello.html
{% endhighlight %}

**代码 3.3** 一个标准的 HTML 文件，包含一个友好的欢迎信息 <br />`public/hello.html`

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <title>Greeting</title>
  </head>
  <body>
    <p>Hello, world!</p>
  </body>
</html>
{% endhighlight %}

从代码 3.3 中我们可以看到 HTML 文件的标准结构：位于文件开头的文档类型（document type，简称 doctype）声明，告知浏览器我们所用的 HTML 版本（本例使用的是 HTML5）；<sup>[7](#fn-7)</sup> `head` 部分：本例包含一个 `title` 标签，其内容是“Greeting”；`body` 部分：本例包含一个 `p`（段落）标签，其内容是“Hello,world!”。（缩进是可选的，HTML 并不强制要求使用空格，它会忽略 Tab 和空格，但是缩进可以使文档的结构更清晰。）

现在执行下述命令启动本地浏览器

{% highlight sh %}
$ rails server
{% endhighlight %}

然后访问 <http://localhost:3000/hello.html>。就像前面说过的，Rails 会直接渲染这个页面（如图 3.3）。注意图 3.3 浏览器窗口顶部显示的标题，它就是 `title` 标签的内容，“Greeting”。

![hello_world](assets/images/figures/hello_world.png)

图 3.3：一个新的静态 HTML 文件

这个文件只是用来做演示的，我们的示例程序并不需要它，所以在体验了创建过程之后最好将其删掉：

{% highlight sh %}
$ rm public/hello.html
{% endhighlight %}

现在我们还要保留 `index.html` 文件，不过最后我们还是要将其删除的，因为我们不想把 Rails 默认的页面（如图 1.3）作为程序的首页。[5.3 节](chapter5.html#sec-5-3)会介绍如何将 <http://localhost:3000/> 指向 `public/index.html` 之外的地方。

<h3 id="sec-3-1-2">3.1.2 Rails 中的静态页面</h3>

能够放回静态 HTML 页面固然很好，不过对动态 Web 程序却没有什么用。本节我们要向创建动态页面迈出第一步，我们会创建一系列的 Rails 动作（action），这可比通过静态文件定义 URI  地址要强大得多。<sup>[8](#fn-8)</sup> Rails 的动作会按照一定的目的性归属在某个控制器（[1.2.6 节](chapter1.html#sec-1-2-6)介绍的 MVC 中的 C）中。在[第二章](chapter2.html)中已经简单介绍了控制器，当我们更详细的介绍 [REST 架构](http://en.wikipedia.org/wiki/Representational_State_Transfer)后（从[第六章](chapter6.html)开始）你会更深入的理解它。大体而言，控制器就是一组网页的（也许是动态的）容器。

开始之前，回想一下 [1.3.5 节](chapter1.html#sec-1-3-5)中的内容，使用 Git 时，在一个有别于主分支的独立从分支中工作是一个好习惯。如果你使用 Git 做版本控制，可以执行下面的命令：

{% highlight sh %}
$ git checkout -b static-pages
{% endhighlight %}

Rails 提供了一个脚本用来创建控制器，叫做 `generate`，只要提供控制器的名字就可以运行了。如果你想让 `generate` 同时生成 RSpec 测试用例，你要执行 RSpec 生成器命令，如果在阅读本章前面内容时没有执行这个命令的话，请执行下面的命令：

{% highlight sh %}
$ rails generate rspec:install
{% endhighlight %}

因为我们要创建一个控制器来处理静态页面，所有我们就叫它 StaticPages 吧。同时我们计划创建首页（Home）、帮助（Help）和关于（About）页面的动作。`generate` 可以接受一个可选的参数列表，制定要创建的动作，我们现在只通过命令行创建两个计划的动作（参见代码 3.4）。

**代码 3.4** 创建 StaticPages 控制器

{% highlight sh %}
$ rails generate controller StaticPages home help --no-test-framework
      create  app/controllers/static_pages_controller.rb
       route  get "static_pages/help"
       route  get "static_pages/home"
      invoke  erb
      create    app/views/static_pages
      create    app/views/static_pages/home.html.erb
      create    app/views/static_pages/help.html.erb
      invoke  helper
      create    app/helpers/static_pages_helper.rb
      invoke  assets
      invoke    coffee
      create      app/assets/javascripts/static_pages.js.coffee
      invoke    scss
      create      app/assets/stylesheets/static_pages.css.scss
{% endhighlight %}

注意我们使用了 `--no-test-framework` 选项禁止生成 RSpec 测试代码，因为我们不想自动生成在 [3.2 节](#sec-3-2)会手动创建测试。同时我们还故意从命令行参数中省去了 `about` 动作，稍后我们会看到如何通过 TDD 添加它（[3.2 节](#sec-3-2)）。

顺便说一下，如果在生成代码时出现了错误，知道如何撤销操作就很有用了。[旁注 3.1](#box-3-1) 中介绍了一些如何在 Rails 中撤销操作的方法。

<div id="box-3-1" class="aside">
  <h4>旁注 3.1 撤销操作</h4>
  <p>即使再小心，在开发 Rails 应用程序过程中仍然可能犯错。幸运的是，Rails 提供了一些工具能够帮助你进行复原。</p>
  <p>举例来说，一个常见的情况是你想更改控制器的名字，这是你就要撤销生成的代码。生成控制器时，除了控制器文件本身之外，Rails 还会生成很多其他的文件（参见代码 3.4）。撤销生成的文件不仅仅要删除主要的文件，还要删除一些辅助的文件。（事实上，我们还要撤销对 <code>routes.rb</code> 文件自动做的一些改动。）在 Rails 中，我么你可以通过 <code>rails destroy</code> 命令完成这些操作。一般来说，下面的两个命令是相互抵消的：</p>
  <pre>
    $ rails generate controller FooBars baz quux
    $ rails destroy  controller FooBars baz quux
  </pre>
  <p>同样的，在<a href="chapter6.html">第六章</a>中会使用下面的命令生成模型： </p>
  <pre>
    $ rails generate model Foo bar:string baz:integer
  </pre>
  <p>生成的模型可通过下面的命令撤销：</p>
  <pre>
    $ rails destroy model Foo
  </pre>
  <p>（对模型来说我们可以省略命令行中其余的参数。当阅读到<a href="chapter6.html">第六章</a>时，看看你能否发现为什么可以做。）</p>
  <p>对模型来说涉及到的另一个技术是撤销迁移。<a href="chapter2.html">第二章</a>已经简要的介绍了迁移，<a href="chapter6.html">第六章</a>开始会更深入的介绍。迁移通过下面的命令改变数据库的状态：</p>
  <pre>
    $ rake db:migrate
  </pre>
  <p>我们可以使用下面的命令撤销一个迁移操作：</p>
  <pre>
    $ rake db:rollback
  </pre>
  <p>如果要回到最开始的状态，可以使用：</p>
  <pre>
    $ rake db:migrate VERSION=0
  </pre>
  <p>你可能已经猜到了，将数字 <tt>0</tt>换成其他的数字就会回到相应的版本状态，这些版本数字是按照迁移数量排序的。</p>
  <p>有着这些技术，我们就可以得心的应对开发过程中遇到的各种<a href="http://en.wikipedia.org/wiki/SNAFU">混乱（snafu）</a>了。</p>
</div>

代码 3.4 中生成 StaticPages 控制器的命令会自动更新路由文件（route），叫做 `config/routes.rb`，Rails 会通过这个文件寻找 URI 到网页之间的对应关系。这是我们第一次讲到 `config` 目录，所以让我们看一下目录的结构吧（如图 3.4）。`config` 目录如其名字所示，是存储 Rails 应用程序中的设置文件的。

![config_directory_rails_3](assets/images/figures/config_directory_rails_3.png)

图 3.4：示例程序的 `config` 目录

因为我们生成了 `home` 和 `help` 动作，路由文件中已经为每个动作生成了规则，如代码 3.5。

**代码 3.5** StaticPages 控制器中 `home` 和 `help` 动作的路由配置 <br />`config/routes.rb`

{% highlight rb %}
SampleApp::Application.routes.draw do
  get "static_pages/home"
  get "static_pages/help"
  .
  .
  .
end
{% endhighlight %}

如下的规则

{% highlight rb %}
get "static_pages/home"
{% endhighlight %}

将来自 /static_pages/home 的请求映射到 StaticPages 控制器的 `home` 动作上。另外，当使用 `get` 时会将其对应到 GET 请求方法上，GET 是 HTTP（超文本传输协议，Hypertext Transfer Protocol）支持的基本方法之一（参见[旁注 3.2](#box-3-2)）。在我们这个例子中，当我们在 StaticPages 控制器中生成 `home` 动作时，我们就自动的在 /static_pages/home 地址上获得一个页面了。访问 [/static_pages/home](http://localhost:3000/static_pages/home) 查看页面（如图 3.5）。

![raw_home_view_31](assets/images/figures/raw_home_view_31.png)

图 3.5：简陋的首页视图（[/static_pages/home](http://localhost:3000/static_pages/home)）

<div id="box-3-2" class="aside">
  <h4>旁注 3.2 GET 等</h4>
  <p>超文本传输协议（HTTP）定义了四个基本的操作，对应到四个动词上，分别是 get、post、put 和 delete。这四个词表现了客户端电脑（通常会运行一个浏览器，例如 Firefox 或 Safari）和服务器（通常会运行一个 Web 服务器，例如 Apache 或 Nginx）之间的操作。（有一点很重要需要你知道，当在本地电脑上开发 Rails 应用程序时，客户端和服务器是在同一个物理设备上的，但是二者是不同的概念。）受 REST 架构影响的 Web 框架（包括 Rails）都很重视对 HTTP 动词的实现，我们在<a href="chapter2.html">第二章</a>已经简要介绍了 REST，从<a href="chapter7.html">第七章</a>开始会做更详细的介绍。</p>
  <p>GET 是最常用的 HTTP 操作，用来从网络上读取数据，它的意思是“读取一个网页”，当你访问 google.com 或 wikipedia.org 时，你的浏览器发出的就是 GET 请求。POST 是第二最常用的操作，当你提交表单时浏览器发送的就是 POST 请求。在 Rails 应用程序中，POST 请求一般被用来创建某个东西（不过 HTTP 也允许 POST 进行更新操作）。例如，你提交注册表单时发送的 POST 请求就会在网站中创建一个新用户。剩下的两个动词，PUT 和 DELETE 分别用来更新和销魂服务器上的某个东西。这两个操作比 GET 和 POST 少用一些，因为浏览器没有内建对这两种请求的支持，不过有些 Web 框架（包括 Rails）通过一些聪明的处理方式让它开起来是浏览器发出了这种类型的请求。</p>
</div>

要想弄明白这个页面是怎么来的，让我们在浏览器中看一下 StaticPages 控制器文件吧，你应该会看到类似代码 3.6 的内容。你可能已经注意到了，不像第二章中的 Users 和 Microposts 控制器，StaticPages 控制器没有使用标准的 REST 动作。这对静态页面来说是正常的，REST 架构并不能解决所有的问题。

**代码 3.6** 代码 3.4 生成的 StaticPages 控制器 <br />`app/controllers/static_pages_controller.rb`

{% highlight ruby %}
class StaticPagesController < ApplicationController

  def home
  end

  def help
  end
end
{% endhighlight %}

从上面代码中的 `class` 可以看到 `static_pages_controller.rb` 文件定义了一个类（class），叫做 `StaticPagesController`。类是一种组织函数（也叫方法）的有效方式，例如 `home` 和 `action` 动作就是方法，使用 `def` 关键字定义。尖括号 `<` 说明 `StaticPagesController` 是继承自 Rails 的 `ApplicationController` 类，这就意味着我们定义的页面拥有了 Rails 提供的大量功能。（我们会在 [4.4 节](chapter4.html#sec-4-4)中更详细的介绍类和继承。）

在本例中，StaticPages 控制器的两个方法默认都是空的：

{% highlight ruby %}
def home
end

def help
end
{% endhighlight %}

如果是普通的 Ruby 代码，这两个方法什么也做不了。不过在 Rails 中就不一样了，`StaticPagesController` 是一个 Ruby 类，因为它继承自 `ApplicationController`，它的方法对 Rails 来说就有特殊的意义了：访问 /static_pages/home 时，Rails 在 StaticPages 控制器中寻找 `home` 动作，然后执行该动作，再渲染相应的视图（[1.2.6 节](chapter1.html#sec-1-2-6)中介绍的 MVC 中的 V）。在本例中，`home` 动作是空的，所以访问 /static_pages/home 后只会渲染视图。那么，视图是什么样子，怎么才能找到它呢？

如果你再看一下代码 3.4 的输出，或许你能猜到动作和视图之间的对应关系：`home` 动作对应的视图叫做 `home.html.erb`。[3.3 节](#sec-3-3)将告诉你 `.erb` 是什么意思。看到 `.html` 你或许就不会奇怪了，它基本上就是 HTML（代码 3.7）。

**代码 3.7** 为首页生成的视图 <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<h1>StaticPages#home</h1>
<p>Find me in app/views/static_pages/home.html.erb</p>
{% endhighlight %}

`help` 动作的视图代码类似（参见代码 3.8）。

**代码 3.8** 为帮助页面生成的视图 <br />`app/views/static_pages/help.html.erb`

{% highlight erb %}
<h1>StaticPages#help</h1>
<p>Find me in app/views/static_pages/help.html.erb</p>
{% endhighlight %}

这两个视图只是站位用的，它们的内容都包含了一个一级标题（`h1` 标签）和一个显示视图文件完整的相对路径的段落（`p` 标签）。我们会在 [3.3 节](#sec-3-3)中添加一些简单的动态内容。这些静态内容的存在是为了强调一个很重要的事情：Rails 的视图可以只包含静态的 HTML。从浏览器的角度来看，[3.1.1 节](#sec-3-1-1)中的原始 HTML 文件和本节通过控制器和动作的方式渲染的页面没有什么差异，浏览器能看到的只有 HTML。

在本章剩下的内容中，我们回味首页和帮助页面添加一些内容，然后补上 [3.1.2 节](#sec-3-1-2)中丢下的关于页面。然后会添加量很少的动态内容，在每个页面显示不同的标题。

在继续下面的内容之前，如果你使用 Git 的话最好将 StaticPages 控制器相关的文件加入仓库：

{% highlight sh %}
$ git add .
$ git commit -m "Add a StaticPages controller"
{% endhighlight %}

<h2 id="sec-3-2">3.2 第一个测试</h2>

本书采用了一种直观的测试应用程序表现的方法，而不是具体的实现过程，这是 TDD 的一个变种，叫做 BDD（行为驱动开发，Behavior-driven Development）。我们使用的主要工具是集成测试（integration test）和单元测试(unit test)。集成测试在 RSpec 中叫做 request spec，它允许我们模拟用户在浏览器中和应用程序进行交互的操作。和 Capybara 提供的自然语言句法（natural-language syntax）一起使用，集成测试提供了一种强的大方法来测试应用程序的功能而不用在浏览器中手动去检查每个页面。（BDD 另外一个受欢迎的选择是 Cucumber，在 [8.3 节](chapter8.html#sec-8-3)中会介绍。）

TDD 的质量得益于测试优先，比编写应用程序的代码还早。刚接触的话要花一段时间才能适应这种方式，不过好处很明显。我们先写一个失败测试（failing test），然后编写代码使这个测试通过，这样我们就会相信测试真的是针对我们设想的功能。这种“失败-实现-通过”的开发循环包含了一个[心流](http://en.wikipedia.org/wiki/Flow_\(psychology\))，可以提高编程的乐趣并提高效率。测试还扮演着应用程序代码客户的角色，会提高软件设计的优雅性。

关于 TDD 有一点很重要需要你知道，它不是万用良药，没必要固执的认为总是要先写测试、测试要囊括程序所有的功能、所有情况都要写测试。例如，当你不确定如何处理某些编程问题时，通常推荐你跳过测试先编写代码看一下解决方法能否解决问题。（在[极限编程](http://en.wikipedia.org/wiki/Extreme_Programming)中，这个过程叫做“探针实验（spike）”。）一旦看到了解决问题的曙光，你就可以使用 TDD 实现一个更完美的版本。

本节我们会使用 RSpec 提供的 `rspec` 命令运行测试。初看起来这样做是应该的，不过却不完美，如果你是个高级用户我建议你按照 [3.6 节](#sec-3-6)的内容设置一下你的系统。

<h3 id="sec-3-2-1">3.2.1 测试驱动开发</h3>

在测试驱动开发中，我们先写一个会失败的测试，在很多测试工具中会将其显示为红色。然后编写代码让测试通过，显示为绿色。最后，如果需要的话，我们还会重构代码，改变实现的方式（例如消除代码重复）但不改变功能。这样的开发过程叫做“遇红，变绿，重构（Red, Green, Refactor）”。

我们先来使用 TDD 为首页增加一些内容，一个内容更为 `Sample App` 的顶级标题（`<h1>`）。第一步要做的是为这些静态页面生成集成测试（request spec）：

{% highlight sh %}
$ rails generate integration_test static_pages
      invoke  rspec
      create    spec/requests/static_pages_spec.rb
{% endhighlight %}

上面的代码会在 `rspec/requests` 文件夹中生成 `static_pages_spec.rb` 文件。自动生成的代码不能满足我们的需求，用文本编辑器打开 `static_pages_spec.rb`，将其内容替换成代码 3.9 所示的代码。

**代码 3.9** 测试首页内容的代码 <br />`spec/requests/static_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the content 'Sample App'" do
      visit '/static_pages/home'
      page.should have_content('Sample App')
    end
  end
end
{% endhighlight %}

代码 3.9 是纯粹的 Ruby，不过即使你以前学习过 Ruby 也看不太懂，这是因为 RSpec 利用了 Ruby 语言的延展性定义了一套“领域特殊语言”（DSL=Domain-Specifi Language）用来写测试代码。重要的是，如果你向使用 RSpec 不是一定要知道 RSpec 的句法。初看起来是有些神奇，RSpec 和 Capybara 就是这样设计的，读起来很像英语，如果你多看一些 `generate` 命令生成的测试或者本书中的示例，很快你就会熟捻了。

代码 3.9 包含了一个 `describe` 块以及其中的一个测试用例（sample），以 `it "..." do` 开头的代码块就是一个用例：

{% highlight ruby %}
describe "Home page" do

  it "should have the content 'Sample App'" do
    visit '/static_pages/home'
    page.should have_content('Sample App')
  end
end
{% endhighlight %}

第一行代码指明我们描绘的是首页，描绘的内容就是一个字符串，如果需要你可以使用任何的字符串，RSpec 不做强制要求，不过你以及其他的人类读者或许会关心你用的字符串。然后测试说，如果你访问地址为 `/static_pages/home` 的首页时，其内容应该包含“Sample App”这两个词。和第一行一样，这个双引号中的内容 RSpec 没做要求，只要能为人类读者提供足够的信息就行了。下面这一行：

{% highlight ruby %}
visit '/static_pages/home'
{% endhighlight %}

使用了 Capybara 中的 `visit` 函数来模拟在浏览器中访问 `/static_pages/home` 的操作。下面这一行：

{% highlight ruby %}
page.should have_content('Sample App')
{% endhighlight %}

使用了 `page` 变量（同样由 Capybara 提供）来测试页面中是否包含了正确的内容。

我们有很多种方式来运行测试代码，[3.6 节](#sec-3-6)中还提供了一些便利且高级的方法。目前，我们在命令行中执行 `rspec` 命令（前面会加上 `bundle exec` 来保证 RSpec 运行在 Gemfile 中指定的环境中）：<sup>[9](#fn-9)</sup>

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

上述命令会输出一个失败测试。失败测试的具体样子取决于你的系统，在我的系统中它是红色的，如图 3.6。（截图中显示了当前所在的 Git 分支，是 master 而不是 staticpages，这个问题你先不要在意。）

![red_failing_spec](assets/images/figures/red_failing_spec.png)

图 3.6：一个红色（失败）的测试

要想让测试通过，我们要用代码 3.10 中的 HTML 替换掉默认的首页内容。

**代码 3.10** 让首页测试通过的代码 <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<h1>Sample App</h1>
<p>
  This is the home page for the
  <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
  sample application.
</p>
{% endhighlight %}

这段代码中一级标题（`<h1>`）的内容是 `Sample App` 了，会让测试通过。我们还加了一个锚记标签 `<a>`，链接到一个给定的地址（在锚记标签中地址由“href”（hypertext reference）指定）：

{% highlight html %}
<a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
{% endhighlight %}

现在再运行测试看一下结果：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

在我的系统中，通过的测试显示如图 3.7 所示。

![green_passing_spec](assets/images/figures/green_passing_spec.png)

图 3.7：一个绿色（通过）的测试

基于上面针对首页的例子，或许你已经猜到了帮助页面类似的测试和程序代码。我们先来测试一下相应的内容，现在我们的字符串变成“`Help`”了（参见代码 3.11）。

**代码 3.11** 添加测试帮助页面内容的代码 <br />`spec/requests/static_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the content 'Sample App'" do
      visit '/static_pages/home'
      page.should have_content('Sample App')
    end
  end

  describe "Help page" do

    it "should have the content 'Help'" do
      visit '/static_pages/help'
      page.should have_content('Help')
    end
  end
end
{% endhighlight %}

然后运行测试：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

有一个测试会失败。（因为系统的不同，而且统计每个阶段的测试数量很难，从现在开始我就不会再截图 RSpec 的输出结果了。）

程序所需的代码（原始的 HTML）和代码 3.10 类似，如代码 3.12 所示。

**代码 3.12** 让帮助页面的测试通过的代码 <br />`app/views/static_pages/help.html.erb`

{% highlight erb %}
<h1>Help</h1>
<p>
  Get help on the Ruby on Rails Tutorial at the
  <a href="http://railstutorial.org/help">Rails Tutorial help page</a>.
  To get help on this sample app, see the
  <a href="http://railstutorial.org/book">Rails Tutorial book</a>.
</p>
{% endhighlight %}

现在测试应该可以通过了：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

<h3 id="sec-3-2-2">3.2.2 添加页面</h3>

看过了上面简单的 TDD 开发过程，下面我们要用这个技术完成一个稍微复杂一些的任务，添加一个新页面，就是 [3.1.3 节](#sec-3-1-2)中没有生成的“关于”页面。通过每一步中编写测试和运行 RSpec 的过程，我们会看到 TDD 是如何引导我们进行应用程序代码开发的。

<h4>遇红</h4>

先来到“遇红-变绿”过程中的“遇红”部分，为“关于”页面写一个失败测试。按照代码 3.11 的代码，或许你已经知道如何写这个测试了（参见代码 3.13）。

**代码 3.13** 添加测试“关于”页面内容的代码 <br />`spec/requests/static_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the content 'Sample App'" do
      visit '/static_pages/home'
      page.should have_content('Sample App')
    end
  end

  describe "Help page" do

    it "should have the content 'Help'" do
      visit '/static_pages/help'
      page.should have_content('Help')
    end
  end

  describe "About page" do

    it "should have the content 'About Us'" do
      visit '/static_pages/about'
      page.should have_content('About Us')
    end
  end
end
{% endhighlight %}

<h4>变绿</h4>

回顾一下 [3.1.2 节](#sec-3-1-2)的内容，在 Rails 中我们可以通过创建一个动作并添加相应的视图文件来生成一个静态页面。所以首先我们要在 StaticPages 控制器中添加一个 `about` 动作。我们已经写过失败测试了，现在已经相信，如果能让它通过，我们就可以创建一个可以运行的“关于”页面。

如果你运行 RSpec 测试：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

输出的结果会提示下面的错误：

{% highlight sh %}
No route matches [GET] "/static_pages/about"
{% endhighlight %}

这提醒我们要在路由文件中添加 `static_pages/about`，我们可以按照代码 3.5 所示的格式添加，结果如代码 3.14 所示。

**代码 3.14** 添加 `about` 页面的路由 <br />`config/routes.rb`

{% highlight ruby %}
SampleApp::Application.routes.draw do
  get "static_pages/home"
  get "static_pages/help"
  get "static_pages/about"
  .
  .
  .
end
{% endhighlight %}

现在运行

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

将提示如下错误

{% highlight sh %}
The action 'about' could not be found for StaticPagesController
{% endhighlight %}

为了解决这个问题，我们按照代码 3.6 中 `home` 和 `help` 的格式在 StaticPages 控制器中添加 `about` 动作的代码（如代码 3.15 所示）。

**代码 3.15** 添加了 `about` 动作的 StaticPages 控制器 <br />`app/controllers/static_pages_controller.rb`

{% highlight sh %}
class StaticPagesController < ApplicationController

  def home
  end

  def help
  end

  def about
  end
end
{% endhighlight %}

再运行

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

会提示缺少模板（template，例如一个视图）：

{% highlight sh %}
ActionView::MissingTemplate:
  Missing template static_pages/about
{% endhighlight %}

要解决这个问题，我们要添加 `about` 相应的视图。我们需要在 `app/views/static_pages` 目录下创建一个名为 `about.html.erb` 的新文件，写入代码 3.16 所示的内容。

**代码 3.16** “关于”页面的源码 <br />`app/views/static_pages/about.html.erb`

{% highlight erb %}
<h1>About Us</h1>
<p>
  The <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
  is a project to make a book and screencasts to teach web development
  with <a href="http://rubyonrails.org/">Ruby on Rails</a>. This
  is the sample application for the tutorial.
</p>
{% endhighlight %}

再运行 RSpec 就应该“变绿”了：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

当然，在浏览器中查看一下这个页面来确保测试没有失效也是个不错的主意。（如图 3.8）

![about_us_2nd_edition](assets/images/figures/about_us_2nd_edition.png)

图 3.8：新添加的“关于”页面（[/static_pages/about](http://localhost:3000/static_pages/about)）

<h4>重构</h4>

现在测试已经变绿了，我们可以很自信的尽情重构了。我们的代码经常会“变味”（意思是代码会变得丑陋、啰嗦、大量的重复），电脑不会在意，但是人类会，所以经常的重构来让代码变得简洁是很重要的。这时候一个好的测试就显出其价值了，因为它可以降低重构过程中引入 bug 的风险。

我们的示例程序现在还很小没什么可重构的，不过代码无时无刻不在变味，所以我们的重构也不会等很久：在 [3.3.4 节](#sec-3-3-4)中就要忙于重构了。

<h2 id="sec-3-3">3.3 有点动态内容的页面</h2>

到目前为止，我们已经为一些静态页面创建了动作和视图，我们还改变每一个页面显示的内容（标题）让它看起来是动态的。改变标题到底算不算真正动态还说不准，不过前面的内容却可以为[第七章](chapter7.html)介绍的真正动态打下基础。

如果你跳过了 [3.2 节](#sec-3-2)中的 TDD 部分，在继续阅读之前先按照代码 3.14、代码 3.15 和代码 3.16 创建“关于”页面。

<h3 id="sec-3-3-1">3.3.1 测试标题的变化</h3>

我们计划修改“首页”、“帮助”页面和“关于”页面的标题，让它在每一页都有所变化。这个过程将使用视图中的 `<title>` 标签。大多数浏览器会在浏览器窗口的顶部显示标题的内容（Google Chrome 是个特例），标题对搜索引擎优化也是很重要的。我们会先写测试标题的代码，然后添加标题，再然后使用一个布局（layout）文件进行重构，削减重复。

你可能已经注意到了，`rails new` 命令已经创建了布局文件。稍后我们会介绍这个文件的作用，现在在继续之前先将其重命名：

{% highlight sh %}
$ mv app/views/layouts/application.html.erb foobar   # 临时修改
{% endhighlight %}

（`mv` 是 Unix 命令，在 Windows 中你可以在文件浏览器中重命名或者使用 `rename` 命令。）在真正的应用程序中你不需要这么做，不过没有了这个文件之后你就能更容易理解它的作用。

<table id="table-3-1" class="tabular">
  <tbody>
    <tr>
      <th class="align_center"><strong>页面</strong></th>
      <th class="align_left"><strong>URI</strong></th>
      <th class="align_left"><strong>基本标题</strong></th>
      <th class="align_left"><strong>变动的标题</strong></th>
    </tr>
    <tr class="top_bar">
      <td class="align_center">首页</td>
      <td class="align_left">/static_pages/home</td>
      <td class="align_left"><code>"Ruby on Rails Tutorial Sample App"</code></td>
      <td class="align_left"><code>"Home"</code></td>
    </tr>
    <tr>
      <td class="align_center">帮助</td>
      <td class="align_left">/static_pages/help</td>
      <td class="align_left"><code>"Ruby on Rails Tutorial Sample App"</code></td>
      <td class="align_left"><code>"Help"</code></td>
    </tr>
    <tr>
      <td class="align_center">关于</td>
      <td class="align_left">/static_pages/about</td>
      <td class="align_left"><code>"Ruby on Rails Tutorial Sample App"</code></td>
      <td class="align_left"><code>"About"</code></td>
    </tr>
  </tbody>
</table>

表格 3.1：示例程序中基本上是静态内容的页面

本节结束后，三个静态页面的标题都会是“Ruby on Rails Tutorial Sample App | Home”这种形式，标题的后面一部分会根据所在页面有所不同（参见[表格 3.1](#table-3-1)）。我们接着代码 3.3 中的测试接着写，添加代码 3.17 所示测试标题的代码。

**代码 3.17** 标题测试

{% highlight ruby %}
it "should have the right title" do
  visit '/static_pages/home'
  page.should have_selector('title',
                    :text => "Ruby on Rails Tutorial Sample App | Home")
end
{% endhighlight %}

`have_selector` 方法会测试一个 HTML 元素（“selector”的意思）是否有指定的内容。换句话说，下面的代码：

{% highlight ruby %}
page.should have_selector('title',
                  :text => "Ruby on Rails Tutorial Sample App | Home")
{% endhighlight %}

检查 `title` 标签的内容是否为

{% highlight ruby %}
"Ruby on Rails Tutorial Sample App | Home"
{% endhighlight %}

（在 [4.3.3 节](chapter4.html#sec-4-3-3)中我们会介绍，`:text => "…"` 是一个以 Symbol 为键值的 Hash。）你要注意一下，检查的内容不一定要完全匹配，任何的子字符串都可以，所以

{% highlight ruby %}
page.should have_selector('title',
                  :text => " | Home")
{% endhighlight %}

也会匹配完整形式的标题。

注意，在代码 3.17 中，我们将 `have_selector` 方法切成两行显示，这种用法说明了 Ruby 句法中一个很重要的原则：Ruby 不介意换行。<sup>[11](#fn-11)</sup> 我之所以把代码切成两行是因为我要保证代码的每一行都少于 80 个字符，这样能提高可读性。<sup>[12](#fn-12)</sup> 即使这样，代码的结构还是很乱，在 [3.5 节](#sec-3-5)中会有个重构的练习，将代码结构变得更好一些，在 [5.3.4 节](chapter5.html#sec-5-3-4)中会使用 RSpec 最新的功能完全重写 StaticPages 测试。

按照代码 3.17 的格式为三个静态页面都加上测试代码，结果参照代码 3.18。

**代码 3.18** StaticPages 控制器的测试文件，包含标题测试 <br />`spec/requests/static_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the h1 'Sample App'" do
      visit '/static_pages/home'
      page.should have_selector('h1', :text => 'Sample App')
    end

    it "should have the title 'Home'" do
      visit '/static_pages/home'
      page.should have_selector('title',
                        :text => "Ruby on Rails Tutorial Sample App | Home")
    end
  end

  describe "Help page" do

    it "should have the h1 'Help'" do
      visit '/static_pages/help'
      page.should have_selector('h1', :text => 'Help')
    end

    it "should have the title 'Help'" do
      visit '/static_pages/help'
      page.should have_selector('title',
                        :text => "Ruby on Rails Tutorial Sample App | Help")
    end
  end

  describe "About page" do

    it "should have the h1 'About Us'" do
      visit '/static_pages/about'
      page.should have_selector('h1', :text => 'About Us')
    end

    it "should have the title 'About Us'" do
      visit '/static_pages/about'
      page.should have_selector('title',
                    :text => "Ruby on Rails Tutorial Sample App | About Us")
    end
  end
end
{% endhighlight %}

注意我们把 `have_content` 换成了更具体的 `have_selector('h1', ...)`。试试你能不能猜到原因。（提示：试想一下如果标题的内容是“Help”，但是 `h1` 标签中的内容是“Helf”会出现什么情况？）

现在已经有了如代码 3.18 所示的测试，你应该运行

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

确保得到的结果是红色的（失败的测试）。

<h3 id="sec-3-3-2">3.3.2 让标题测试通过</h3>

现在我们要让标题测试通过，同时我们还要完善 HTML，让它通过验证。先来看“首页”，它的 HTML 和代码 3.3 中欢迎页面的结构类似。

**代码 3.19** “首页”的完整 HTML <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title>Ruby on Rails Tutorial Sample App | Home</title>
  </head>
  <body>
    <h1>Sample App</h1>
    <p>
      This is the home page for the
      <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
      sample application.
    </p>
  </body>
</html>
{% endhighlight %}

代码 3.19 使用了代码 3.18 中测试用到的标题：

{% highlight html %}
<title>Ruby on Rails Tutorial Sample App | Home</title>
{% endhighlight %}

所以，“首页”的测试现在应该可以通过了。你还会看到红色的错误提示是因为“帮助”页面和“关于”页面的测试还是失败的，我们使用代码 3.20 和代码 3.21 中的代码让它们也通过测试。

**代码 3.20** “帮助”页面的完整 HTML <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title>Ruby on Rails Tutorial Sample App | Help</title>
  </head>
  <body>
    <h1>Help</h1>
    <p>
      Get help on the Ruby on Rails Tutorial at the
      <a href="http://railstutorial.org/help">Rails Tutorial help page</a>.
      To get help on this sample app, see the
      <a href="http://railstutorial.org/book">Rails Tutorial book</a>.
    </p>
  </body>
</html>
{% endhighlight %}

**代码 3.21** “关于”页面的完整 HTML <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title>Ruby on Rails Tutorial Sample App | About Us</title>
  </head>
  <body>
    <h1>About Us</h1>
    <p>
      The <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
      is a project to make a book and screencasts to teach web development
      with <a href="http://rubyonrails.org/">Ruby on Rails</a>. This
      is the sample application for the tutorial.
    </p>
  </body>
</html>
{% endhighlight %}

<h3 id="sec-3-3-3">3.3.3 嵌入式 Ruby</h3>

本节到目前位置已经做了很多事情，我们通过 Rails 控制器和动作生成了三个可以通过验证的页面，不过这些页面都是纯静态的 HTML，没有体现出 Rails 的强大所在。而且，它们的代码充斥着重复：

- 页面的标签几乎（但不完全）是一模一样的
- 每个标题中都有“Ruby on Rails Tutorial Sample App”
- HTML 结构在每个页面都重复的出现了

代码重复的问题违反了很重要的“不要自我重复”（Don't Repeat Yourself, DRY）原则，本小节和下一小节将按照 DRY 原则去掉重复的代码。

不过我们去除重复的第一步却是奥增加一些代码让页面的标题看起来是一样的。这样我们就可以更容易的去掉重复的代码了。

这个过程会在视图中使用嵌入式 Ruby（Embedded Ruby）。既然“首页”、“帮助”页面和“关于”页面的标题有一个变动的部分，那我们就利用一个 Rails 中特别的函数 `provide` 在每个页面设定不同的标题。通过将视图 `home.html.erb` 标题中的“Home”换成如代码 3.22 所示的代码，我们可以看一下是怎么实现的。

**代码 3.22** 标题中使用了嵌入式 Ruby 代码的“首页”视图 <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<% provide(:title, 'Home') %>
<!DOCTYPE html>
<html>
  <head>
    <title>Ruby on Rails Tutorial Sample App | <%= yield(:title) %></title>
  </head>
  <body>
    <h1>Sample App</h1>
    <p>
      This is the home page for the
      <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
      sample application.
    </p>
  </body>
</html>
{% endhighlight %}

代码 3.22 使我们第一次使用嵌入式 Ruby，简称 ERb。（现在你应该知道为什么 HTML 视图文件的扩展名是 `.html.erb` 了。）ERb 是为网页添加动态动容使用的主要模板系统。<sup>[13](#fn-13)</sup> 下面的代码

{% highlight erb %}
<% provide(:title, 'Home') %>
{% endhighlight %}

通过 `<% ... %>` 调用 Rails 中的 `provide` 函数，然后将字符串 `'Home'` 赋给 `:title`。<sup>[14](#fn-14)</sup> 然后，在标题中，我们使用类似的符号 `<%= ... %>` 通过 Ruby 的 `yield` 函数将标题插入模板中：<sup>[15](#fn-15)</sup>

{% highlight erb %}
<title>Ruby on Rails Tutorial Sample App | <%= yield(:title) %></title>
{% endhighlight %}

（这两种嵌入 Ruby 代码的方式区别在于，`<% ... %>` **执行**其中的代码，`<%= ... %>` 也会执行其中的代码并将结果**插入**模板中。）最终得到的结果和以前是一样的，只不过标题中变动的部分现在是通过 ERb 动态生成的。

我们可以运行 [3.3.1 节](#sec-3-3-1)中的测试来证实一下，测试还是会通过：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

然后我们要对“帮助”页面和“关于”页面做相应的修改了。（参见代码 3.23 和代码 3.24。）

**代码 3.23** 标题中使用了嵌入式 Ruby 代码的“帮助”页面视图 <br />`app/views/static_pages/help.html.erb`

{% highlight erb %}
<% provide(:title, 'Help') %>
<!DOCTYPE html>
<html>
  <head>
    <title>Ruby on Rails Tutorial Sample App | <%= yield(:title) %></title>
  </head>
  <body>
    <h1>Help</h1>
    <p>
      Get help on the Ruby on Rails Tutorial at the
      <a href="http://railstutorial.org/help">Rails Tutorial help page</a>.
      To get help on this sample app, see the
      <a href="http://railstutorial.org/book">Rails Tutorial book</a>.
    </p>
  </body>
</html>
{% endhighlight %}

**代码 3.24** 标题中使用了嵌入式 Ruby 代码的“关于”页面视图 <br />`app/views/static_pages/help.html.erb`

{% highlight erb %}
<% provide(:title, 'About Us') %>
<% provide(:title, 'About Us') %>
<!DOCTYPE html>
<html>
  <head>
    <title>Ruby on Rails Tutorial Sample App | <%= yield(:title) %></title>
  </head>
  <body>
    <h1>About Us</h1>
    <p>
      The <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
      is a project to make a book and screencasts to teach web development
      with <a href="http://rubyonrails.org/">Ruby on Rails</a>. This
      is the sample application for the tutorial.
    </p>
  </body>
</html>
{% endhighlight %}

<h3 id="sec-3-3-4">3.3.4 使用布局文件来消除重复</h3>

我们已经使用 ERb 将页面标题中变动的部分替换掉了，每一个页面的代码很类似：

{% highlight erb %}
<% provide(:title, 'Foo') %>
<!DOCTYPE html>
<html>
  <head>
    <title>Ruby on Rails Tutorial Sample App | <%= yield(:title) %></title>
  </head>
  <body>
    <!--内容-->
  </body>
</html>
{% endhighlight %}

换句话说，所有的页面结构都是一致的，包括标题标签中的内容，只是 `body` 标签中的内容有细微的差别。

为了提取出相同的结构，Rails 提供了一个特别的布局文件，叫做 `application.html.erb`，我们在 [3.3.1 节](#sec-3-3-1)中将它重命名了，现在我们再改回来：

{% highlight sh %}
$ mv foobar app/views/layouts/application.html.erb
{% endhighlight %}

为了让布局正常的运行，我们要把默认的标题改为前几例代码中使用的嵌入式 Ruby 代码：

{% highlight erb %}
<title>Ruby on Rails Tutorial Sample App | <%= yield(:title) %></title>
{% endhighlight %}

最终的布局文件如代码 3.15 所示。

**代码 3.25** 示例程序的网站布局 <br />`app/views/layouts/application.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title>Ruby on Rails Tutorial Sample App | <%= yield(:title) %></title>
    <%= stylesheet_link_tag    "application", :media => "all" %>
    <%= javascript_include_tag "application" %>
    <%= csrf_meta_tags %>
  </head>
  <body>
    <%= yield %>
  </body>
</html>
{% endhighlight %}

注意一下比较特殊的一行

{% highlight erb %}
<%= yield %>
{% endhighlight %}

这行代码是用来将每一页的内容插入布局中的。没必要了解它的具体实现过程，我们只需要知道，在布局中使用它在访问 /static_pages/home 时会将 `home.html.erb` 中的内容转换成 HTML 然后插入 `<%= yield %>` 所在的位置。

还要注意一下，默认的 Rails 布局文件包含几行特殊的代码：

{% highlight erb %}
<%= stylesheet_link_tag    "application", :media => "all" %>
<%= javascript_include_tag "application" %>
<%= csrf_meta_tags %>
{% endhighlight %}

这些代码会引入应用程序的样式表和 JavaScript 文件（asset pipeline 的一部分）；Rails 中的 `csrf_meta_tags` 方法是用来避免“跨站请求伪造”（cross-site request forgery，CSRF，一种网络攻击）的。

现在代码 3.22、代码 3.23 和代码 3.24 的内容还是和布局文件中类似的 HTML，所以我们要将内容删除，只保留需要的部分。清除后的视图如代码 3.26、代码 3.27 和代码 3.28 所示。

**代码 3.26** 去除完整的 HTML 结构后的“首页” <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<% provide(:title, 'Home') %>
<h1>Sample App</h1>
<p>
  This is the home page for the
  <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
  sample application.
</p>
{% endhighlight %}

**代码 3.27** 去除完整的 HTML 结构后的“帮助”页面 <br />`app/views/static_pages/help.html.erb`

{% highlight erb %}
<% provide(:title, 'Help') %>
<h1>Help</h1>
<p>
  Get help on the Ruby on Rails Tutorial at the
  <a href="http://railstutorial.org/help">Rails Tutorial help page</a>.
  To get help on this sample app, see the
  <a href="http://railstutorial.org/book">Rails Tutorial book</a>.
</p>
{% endhighlight %}

**代码 3.28** 去除完整的 HTML 结构后的“关于”页面 <br />`app/views/static_pages/about.html.erb`

{% highlight erb %}
<% provide(:title, 'About Us') %>
<h1>About Us</h1>
<p>
  The <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
  is a project to make a book and screencasts to teach web development
  with <a href="http://rubyonrails.org/">Ruby on Rails</a>. This
  is the sample application for the tutorial.
</p>
{% endhighlight %}

修改这几个视图后，“首页”、“帮助”页面和“关于”页面显示的内容还和之前一样，但是却没有重复的内容了。运行一下测试看是否还会通过，通过了才能证实重构是成功的：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}
