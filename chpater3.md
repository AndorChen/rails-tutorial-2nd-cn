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
