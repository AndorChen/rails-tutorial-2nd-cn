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

