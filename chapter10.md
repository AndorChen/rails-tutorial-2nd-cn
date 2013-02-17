---
layout: chapter
title: 第十章 用户的微博
---

我们在[第九章](chapter9.html)中已经实现了一个完整且符合 REST 架构的资源：用户，本章我们要再实现一个资源：用户微博（micropost）。<sup>[1](#fn-1)</sup>微博是由用户发布的一种简短消息，我们在[第 2 章]中实现过微博雏形。 本章我们会在 [2.3 节](chapter2.html#sec-2-3)的基础上，实现一个功能完善的微博功能。首先，我们要创建微博所需的数据模型，通过  `has_many` 和 `belongs_to` 方法把微博和用户关联起来，再建立处理和显示微博所需的表单及局部视图。在 [第 11 章](chapter11.html)，还要加入关注其他用户的功能，其时，我们这个山寨版 Twitter 才算完成。

如果你使用 Git 做版本控制的话，和之前一样，我建议你新建一个分支：

```sh
$ git checkout -b user-microposts
```

<h2 id="sec-10-1">10.1 微博模型</h2>

实现微博资源的第一步是创建微博所需的数据模型，在模型中设定微博的基本属性。和 [2.3 节](chapter2.html#sec-2-3) 创建的模型类似，我们要实现的 Micropost 模型要包含数据验证，以及和用户模型的关联。除此之外，我们会做充分的测试，指定默认的排序方式，自动删除已注销用户的微博。

<h3 id="sec-10-1-1">10.1.1 基本模型</h3>

微博模型只需要两个属性：其一是 `content`，用来保存微博的内容；<sup>[2](#fn-2)</sup>其二是 `user_id`，把当前微博和用户关联起来。我们使用 `generate model` 命令生成所需的模型，这一点和创建用户模型时是一样的（参见代码 6.1）：

```sh
$ rails generate model Micropost content:string user_id:integer
```

这个命令会生成一个迁移文件，作用是在数据库中生成一个名为 `microposts` 的表（参见代码 10.1）。读者朋友可以和生成 `users` 表的迁移文件对照一下（参见代码 6.2）。

**代码 10.1** 创建微博模型的迁移文件（注意：为 `user_id` 和 `created_at` 列加入了索引）<br />`db/migrate/[timestamp]_create_microposts.rb`

```ruby
class CreateMicroposts < ActiveRecord::Migration
  def change
    create_table :microposts do |t|
      t.string :content
      t.integer :user_id

      t.timestamps
    end
    add_index :microposts, [:user_id, :created_at]
  end
end
```

注意，因为我们设想要按照发布时间的倒序查询某个用户所有的微博，所以在上述代码中为 `user_id` 和 `created_at` 列加入了索引：

```ruby
add_index :microposts, [:user_id, :created_at]
```

我们把 `user_id` 和 `created_at` 放在一个数组中，告诉 Rails 我们要创建的是“多键索引（multiple key index）”，Active Record 便会同时使用这两个键。还要注意 `t.timestamps` 这行，我们在 [6.1.1 节](chapter6.html#sec-6-1-1)中介绍过，它会自动创建 `created_at` 和 `updated_at` 两个属性。在 [10.1.4 节](chapter10.html#sec-10-1-4) 和 [10.2.1 节](chapter10.html#sec-10-2-1) 中才会用到 `created_at`。

我们先参照用户模型的测试（参照代码 6.8），为微博模型编写一些基本的测试。我们要测试微博对象是否可以响应 `content` 和 `user_id` 方法，如代码 10.2 所示。

**代码 10.2** 微博模型测试（初始版）<br />`spec/models/micropost_spec.rb`

```ruby
require 'spec_helper'

describe Micropost do

  let(:user) { FactoryGirl.create(:user) }
  before do
    # This code is wrong!
    @micropost = Micropost.new(content: "Lorem ipsum", user_id: user.id)
  end

  subject { @micropost }

  it { should respond_to(:content) }
  it { should respond_to(:user_id) }
end
```

若要这个测试通过，我们先要执行数据库迁移，再准备好“测试数据库”：

```sh
$ bundle exec rake db:migrate
$ bundle exec rake db:test:prepare
```

执行上面两个命令之后，会生成微博模型，结构如图 10.1 所示。

![micropost_model](assets/images/figures/micropost_model.png)

图 10.1：微博数据模型

然后确认测试是否可以通过：

```sh
$ bundle exec rspec spec/models/micropost_spec.rb
```

测试虽然可以通过，不过你可能注意到代码 10.2 中的这几行代码了：

```ruby
let(:user) { FactoryGirl.create(:user) }
before do
  # This code is wrong!
  @micropost = Micropost.new(content: "Lorem ipsum", user_id: user.id)
end
```

就像其中的注释所说，`before` 块中的代码是错误的。你可以想一下为什么，我们会在下一小节中告诉你答案。

<h3 id="sec-10-1-2">10.1.2 可访问的属性和第一个数据验证</h3>

要知道为什么 `before` 块中的代码是错误的，我们先要为微博模型编写一个数据验证测试，如代码 10.3 所示。（读者朋友可以和代码 6.11 中针对用户模型的测试对比一下。）

**代码 10.3** 测试微博能否通过验证<br />`spec/models/micropost_spec.rb`

```ruby
require 'spec_helper'

describe Micropost do

  let(:user) { FactoryGirl.create(:user) }
  before do
    # This code is wrong!
    @micropost = Micropost.new(content: "Lorem ipsum", user_id: user.id)
  end

  subject { @micropost }

  it { should respond_to(:content) }
  it { should respond_to(:user_id) }

  it { should be_valid }

  describe "when user_id is not present" do
    before { @micropost.user_id = nil }
    it { should_not be_valid }
  end
end
```

这段代码测试了微博是否能够通过验证，以及是否指定了 `user_id` 的值。要想让上述测试通过，我们要按照代码 10.4 所示，加入一个简单的存在性验证。

**代码 10.4** 对微博 `user_id` 属性的验证<br />`app/models/micropost.rb`

```ruby
class Micropost < ActiveRecord::Base
  attr_accessible :content, :user_id
  validates :user_id, presence: true
end
```

现在我就来告诉你为什么 `@micropost = Micropost.new(content: "Lorem ipsum", user_id: user.id)` 是错的。

在 Rails 3.2.3 之前，默认情况下微博模型的所有属性都是可访问的，我们在 [6.1.2.2 节](chapter6.html#sec-6-1-2-2)和 [9.4.1.1 节](chapter9.html#sec-9-4-1-1) 中做过介绍，可访问就意味着任何人都可以篡改微博对象的属性值，然后通过命令行发送非法请求。例如，某非法用户可以篡改微博的 `user_id` 属性，把该微博的作者设定为错误的用户。所以，我们要把 `user_id` 从 `attr_accessible` 定义的就=可访问属性列表中删除。如果你真的删除了，上面的测试也就会失败了。我们会在 [10.1.3 节](#sec-10-1-3)中再次让这个测试通过。

<h3 id="sec-10-1-3">10.1.3 用户和微博之间的关联</h3>

在为 Web 程序构建数据模型时，最基本的考虑要素是要能够在不同的模型之间建立关联。在我们这个程序中，每篇微博都关联着一个用户，而每个用户一般都会关联多篇微博。用户和微博之间的关系在 [2.3.3 节](chapter2.html#sec-2-3-3)中简单的介绍过，二者之间的关系如图 10.2 和图 10.3 所示。在实现这种关联的时候，我们会编写针对微博模型的测试，和代码 10.2 不同的是，测试的代码会顾及代码 10.7 中使用的 `attr_accessible`。

![micropost_belongs_to_user](assets/images/figures/micropost_belongs_to_user.png)

图 10.2：微博和用户之间的“属于（`belongs_to`）”关系

![user_has_many_microposts](assets/images/figures/user_has_many_microposts.png)

图 10.3：用户和微博之间的“拥有多个（`has_many`）”关系

使用本小节介绍个 `belongs_to` 和 `has_many` 之后，Rails 会自动创建如[表格 10.1](#table-10-1) 所示的方法。

<table id="table-10-1" class="tabular">
  <tbody>
    <tr>
      <th class="align_left"><strong>方法</strong></th>
      <th class="align_left"><strong>作用</strong></th>
    </tr>
    <tr class="top_bar">
      <td class="align_left"><code>micropost.user</code></td>
      <td class="align_left">返回该微博对用的用户对象</td>
    </tr>
    <tr>
      <td class="align_left"><code>user.microposts</code></td>
      <td class="align_left">返回该用户的所有微博数组</td>
    </tr>
    <tr>
      <td class="align_left"><code>user.microposts.create(arg)</code></td>
      <td class="align_left">创建一篇微博（<code>user_id = user.id</code>）</td>
    </tr>
    <tr>
      <td class="align_left"><code>user.microposts.create!(arg)</code></td>
      <td class="align_left">创建一篇微博（失败时抛出异常）</td>
    </tr>
    <tr>
      <td class="align_left"><code>user.microposts.build(arg)</code></td>
      <td class="align_left">生成一个新的微博对象（<code>user_id = user.id</code>）</td>
    </tr>
  </tbody>
</table>

表格 10.1：用户和微博关联后所得方法的简介

注意，从表格 10.1 可知，相较于以下的方法

```ruby
Micropost.create
Micropost.create!
Micropost.new
```

我们得到了

```ruby
user.microposts.create
user.microposts.create!
user.microposts.build
```

后者才是创建微博的正确方式，即通过相关联的用户对象创建。通过这种方式创建的微博，其 `user_id` 属性会自动设为正确的值，从而解决了 [10.1.2 节](#sec-10-1-2)中提出的问题。所以，我们可以把代码 10.3 中的下述代码

```ruby
let(:user) { FactoryGirl.create(:user) }
before do
  # This code is wrong!
  @micropost = Micropost.new(content: "Lorem ipsum", user_id: user.id)
end
```

修改为

```ruby
let(:user) { FactoryGirl.create(:user) }
before { @micropost = user.microposts.build(content: "Lorem ipsum") }
```

只要正确定义了用户和微博之间的关联关系，`@micropost` 变量的 `user_id` 属性就会自动设为相对应用户的 id。

通过用户对象来创建微博并没有消除 `user_id` 最为可访问属性这一安全隐患，而这一隐患有时如此危险，所以我们要天健一个测试来捕获它，如代码 10.5 所示。

**代码 10.5** 确保 `user_id` 不可访问的测试<br />`spec/models/micropost_spec.rb`

```ruby
require 'spec_helper'

describe Micropost do

  let(:user) { FactoryGirl.create(:user) }
  before { @micropost = user.microposts.build(content: "Lorem ipsum") }

  subject { @micropost }
  .
  .
  .
  describe "accessible attributes" do
    it "should not allow access to user_id" do
      expect do
        Micropost.new(user_id: user.id)
      end.to raise_error(ActiveModel::MassAssignmentSecurity::Error)
    end
  end
end
```

如果调用 `Micropost.new` 方法时指定了非空的 `user_id`，这段测试会检测程序是否抛出了 `MassAssignmentSecurity` 异常。这种处理方式在 Rails 3.2.3 中默认是开启的，但是在之前的版本中却是关闭的，所以你要查看一下你的程序设置是否正确，如代码 10.6 所示。

**代码 10.6** 确保没有正确指定 mass assignment 的属性时 Rails 会抛出异常<br />`config/application.rb`

```ruby
.
.
.
module SampleApp
  class Application < Rails::Application
    .
    .
    .
    config.active_record.whitelist_attributes = true
    .
    .
    .
  end
end
```

对微博模型而言，只有一个属性是需要通过网页修改的，那就是 `content`，所以我们要把 `user_id` 从可访问的属性列表中删掉，如代码 10.7 所示。

**代码 10.7** 有且只有 `content` 属性是可访问的<br />`app/models/micropost.rb`

```ruby
class Micropost < ActiveRecord::Base
  attr_accessible :content

  validates :user_id, presence: true
end
```

如[表格 10.1](#table-10-1) 所示，用户和微博建立关联之后，还会生成 `micropost.user` 方法，返回该微博的用户对象。对此，我们可以使用 `it` 和 `its` 做个测试：

```ruby
it { should respond_to(:user) }
its(:user) { should == user }
```

以上对微博模型的测试总结如代码 10.8 所示。

**代码 10.8** 测试微博和用户之间的关联<br />`spec/models/micropost_spec.rb`

```ruby
require 'spec_helper'

describe Micropost do

  let(:user) { FactoryGirl.create(:user) }
  before { @micropost = user.microposts.build(content: "Lorem ipsum") }

  subject { @micropost }

  it { should respond_to(:content) }
  it { should respond_to(:user_id) }
  it { should respond_to(:user) }
  its(:user) { should == user }

  it { should be_valid }

  describe "accessible attributes" do
    it "should not allow access to user_id" do
      expect do
        Micropost.new(user_id: user.id)
      end.to raise_error(ActiveModel::MassAssignmentSecurity::Error)
    end
  end

  describe "when user_id is not present" do
    before { @micropost.user_id = nil }
    it { should_not be_valid }
  end
end
```

在用户和微博关联关系的用户模型一边，我们会在 [10.1.4 节](#sec-10-1-4)做详细的测试，现在我们只是简单的测试下是否可以响应 `microposts` 方法，如代码 10.9 所示。

**代码 10.9** 测试用户是否可以响应 `microposts` 方法<br />`spec/models/user_spec.rb`

```ruby
require 'spec_helper'

describe User do

  before do
    @user = User.new(name: "Example User", email: "user@example.com",
                     password: "foobar", password_confirmation: "foobar")
  end

  subject { @user }
  .
  .
  .
  it { should respond_to(:authenticate) }
  it { should respond_to(:microposts) }
  .
  .
  .
end
```

写好了上面的测试，实现用户和微博之间关联就简单了：只需分别加入下面这两行代码，代码 10.8 和代码 10.9 中的测试就可以通过了：`belongs_to :user`（如代码 10.10 所示）和 `has_many :microposts`（如代码 10.11 所示）。

**代码 10.10** 微博“属于（`belongs_to`）”用户<br />`app/models/micropost.rb`

```ruby
class Micropost < ActiveRecord::Base
  attr_accessible :content
  belongs_to :user

  validates :user_id, presence: true
end
```

**代码 10.11** 用户“拥有多篇（`has_many`）”微博<br />`app/models/user.rb`

```ruby
class User < ActiveRecord::Base
  attr_accessible :name, :email, :password, :password_confirmation
  has_secure_password
  has_many :microposts
  .
  .
  .
end
```

现在，你应该结合[表格 10.1](#table-10-1)和代码 10.8、代码 10.9，确保你理解了关联的基本知识点。你还应该确保检查一下测试是否是可以通过的：

```sh
$ bundle exec rspec spec/models
```

<h3 id="sec-10-1-4">10.1.4 改进微博模型</h3>

代码 10.9 中的代码并没有深入测试通过 `has_many` 实现的关联，仅仅检测了是否可以响应 `microposts` 方法。本小节，我们会为微博模型加入排序方法和依属关系，还会测试 `user.microposts` 方法的返回结果是否为数组。

我们要在用户模型的测试中生成一些微博，所以现在我们先要创建一个生成微博的预构件。在所创建的预构件中我们要找到一种方法把微博和用户关联起来，幸运的是，在 FactoryGirl 中实现关联是很容易的，如代码 10.12 所示。

**代码 10.12** 完整的预构件文件，包含了创建微博的新预构件<br />`spec/factories.rb`

```ruby
FactoryGirl.define do
  factory :user do
    sequence(:name)  { |n| "Person #{n}" }
    sequence(:email) { |n| "person_#{n}@example.com"}
    password "foobar"
    password_confirmation "foobar"

    factory :admin do
      admin true
    end
  end

  factory :micropost do
    content "Lorem ipsum"
    user
  end
end
```

在 FactoryGirl 中我们只需要在创建微博的预构件中包含一个用户对象就可以实现所需的关联了：

```ruby
factory :micropost do
  content "Lorem ipsum"
  user
end
```

在下一节中会介绍，我们可以使用下面的方法生成一篇微博：

```ruby
FactoryGirl.create(:micropost, user: @user, created_at: 1.day.ago)
```

#### 默认作用域

默认情况下，使用 `user.microposts` 从数据库中读取用户的微博不能保证微博的次序，但是按照博客和 Titter 的习惯，我们希望微博按照创建时间倒序排列，也就是最新创建的微博在最前面。要测试微薄的次序，我们先要创建两篇微博：

```ruby
FactoryGirl.create(:micropost, user: @user, created_at: 1.day.ago)
FactoryGirl.create(:micropost, user: @user, created_at: 1.hour.ago)
```

我们把第二篇微博的创建时间设的晚一些，即 `1.hour.ago`（利用了[旁注 8.1](chapter8.html#box-8-1)中介绍的帮助函数），第一篇微博的创建时间要早一些，是 `1.day.ago`。请注意一下使用 FactoryGirl 创建微博是多么方便：我们不仅可以直接指定微博所属的用户（FactoryGirl 会逃过 `attr_accessible` 限制），还可以设定通常情况下不能自由设定的 `created_at` 属性（因为在 Active Record 做了限制）。（再次说明一下，`created_at` 和 `updated_at` 两个属性是“魔法”列，会被自动设为相应的创建时间戳和更新时间戳，即使手动指定了值也会被覆盖。）

大多数数据库适配器（包括 SQLite 的适配器）读取的微博都是按照 ID 来排序的，因此代码 10.13 中的测试肯定不会通过。在这段测试代码中没有使用 `let`，用的是 `let!`（读作“let bang”），因为 `let` 方法指定的变量是“惰性”的，只有当后续有引用时才会被创建。而我们希望创建的两个微博变量理解被创建，这样才能保证两篇微博时间戳的顺序是正确的，也保证了 `@user.microposts` 数组不是空的。所以我们才用了 `let!` 方法，迫使相应的变量立即被创建。

**代码 10.13** 测试用户微博的次序<br />`spec/models/user_spec.rb`

```ruby
require 'spec_helper'

describe User do
  .
  .
  .
  describe "micropost associations" do

    before { @user.save }
    let!(:older_micropost) do
      FactoryGirl.create(:micropost, user: @user, created_at: 1.day.ago)
    end
    let!(:newer_micropost) do
      FactoryGirl.create(:micropost, user: @user, created_at: 1.hour.ago)
    end

    it "should have the right microposts in the right order" do
      @user.microposts.should == [newer_micropost, older_micropost]
    end
  end
end
```

这个测试中最关键的一行是：

```ruby
@user.microposts.should == [newer_micropost, older_micropost]
```

这行代码表明所创建的微博应该按照创建时间倒序排列，即最新创建的微博排在最前面。这个测试注定是无法通过的，因为微博默认是按照 ID 排序的，应该是 `[older_micropost, newer_micropost]`。这个测试同时也验证了 `has_many` 关联最基本的效果是否正确，即检测 `user.microposts` 返回的结果是否是数组。

要让这个测试通过，我们要使用 Rails 中的 `default_scope` 方法，还要设定它的 `:order` 参数，如代码 10.14 所示。（这是我们第一次接触作用域的概念，在[第 11 章](chapter11.html)中会介绍作用域更一般的用法。）

**代码 10.14** 通过 `default_scope` 设定微博的排序<br />`app/models/micropost.rb`

```ruby
class Micropost < ActiveRecord::Base
  .
  .
  .
  default_scope order: 'microposts.created_at DESC'
end
```

我们通过 `microposts.created_at DESC` 设定了所需的排序，其中 `DESC` 在 SQL 中是“倒序”的意思，即按照由新到旧这种顺序排序。

#### 依属关系：destroy

除了设定恰当的排序外，我们还要对微博模型做另一项改进。我们在 [9.4 节](chapter9.html#sec-9-4)中介绍过，管理员是有权限删除用户的。那么，在删除用户的同时，就有必要把该用户发布的微博也删除。对此我们可以编写一个测试，检测当用户被删除后，其发布的微博是否还在数据库中。

为了能够正确的测试微博是否被删除了，我们先要把用户的一篇微博赋值给一个局部变量，然后在删除这个用户。对此，一种直观的实现方式如下：

```ruby
microposts = @user.microposts
@user.destroy
microposts.each do |micropost|
  # Make sure the micropost doesn't appear in the database.
end
```

可是这种方式并不凑效，这涉及到 Ruby 中数组的一个诡异表现。在 Ruby 中把数组赋值给变量时，只是获取了该数组的引用，而不是数组的值本身，所以如果修改了原始的数组，其他的引用也会改变。举个例子，我们新建一个数组，再把它赋值给另一个变量，然后调用 `reverse!` 反转第一个数组：

```sh
$ rails console
>> a = [1, 2, 3]
=> [1, 2, 3]
>> b = a
=> [1, 2, 3]
>> a.reverse!
=> [3, 2, 1]
>> a
=> [3, 2, 1]
>> b
=> [3, 2, 1]
```

可能有点奇怪，`b` 的值和 `a` 一样也反转了，因为 `a` 和 `b` 指向的是同一个数组。（类似的表现也可以推广到 Ruby 中其他的数据类型，例如字符串和 Hash。）

再来看用户的微博，结果如下：

```sh
$ rails console --sandbox
>> @user = User.first
>> microposts = @user.microposts
>> @user.destroy
>> microposts
=> []
```

（因为我们还没有实现销毁所关联微博的方法，所以上述的操作是无效的，在这里列出来只是要表达这种表现。）我们可以看到，删除用户后，`microposts` 变量的值也为空了，即空的数组 `[]`。

鉴于此，在复制 Ruby 对象是要格外的小心。在赋值一些相对简单的对象时，例如数组，我们可以调用 `dup` 方法：

```sh
$ rails console
>> a = [1, 2, 3]
=> [1, 2, 3]
>> b = a.dup
=> [1, 2, 3]
>> a.reverse!
=> [3, 2, 1]
>> a
=> [3, 2, 1]
>> b
=> [1, 2, 3]
```

（上面展示的是“浅拷贝（shallow copy）”。“深拷贝（deep copy）”是很复杂的，也没用通用的方法，如果你要赋值复杂的数据结构，例如嵌套的数字，可以搜索一下“ruby deep copy”，应该可以找到一些方法。）使用 `dup` 方法后的代码如下：

```ruby
microposts = @user.microposts.dup
@user.destroy
microposts.should_not be_empty
microposts.each do |micropost|
  # Make sure the micropost doesn't appear in the database.
end
```

我们还加入了下面这行：

```ruby
microposts.should_not be_empty
```

这才能确保测试可以扑捉到因为失手删除 `dup` 导致的错误。<sup>[3](#fn-3)</sup> 完整的测试代码如代码 10.15 所示。

**代码 10.15** 测试用户删除后，所发布的微博是否也被删除了<br />`spec/models/user_spec.rb`

```ruby
require 'spec_helper'

describe User do
  .
  .
  .
  describe "micropost associations" do

    before { @user.save }
    let!(:older_micropost) do
      FactoryGirl.create(:micropost, user: @user, created_at: 1.day.ago)
    end
    let!(:newer_micropost) do
      FactoryGirl.create(:micropost, user: @user, created_at: 1.hour.ago)
    end
    .
    .
    .
    it "should destroy associated microposts" do
      microposts = @user.microposts.dup
      @user.destroy
      microposts.should_not be_empty
      microposts.each do |micropost|
        Micropost.find_by_id(micropost.id).should be_nil
      end
    end
  end
  .
  .
  .
end
```

在这个测试中，我们调用的是 `Micropost.find_by_id` 方法，如果没有找到相应的记录这个方法会返回 `nil`。而 `Micropost.find` 方法在没有找到记录时直接抛出异常，比较难测试。（如果你好奇如何测试 `Micropost.find` 抛出的异常，可以使用下面这段代码。）

```ruby
lambda do
  Micropost.find(micropost.id)
end.should raise_error(ActiveRecord::RecordNotFound)
```

要让代码 10.15 中的测试通过，我们甚至不需要加入一行完整的代码，只需在 `has_many` 方法中设定一个参数即可，如代码 10.16 所示。

**代码 10.16** 保证用户的微博在删除用户的同时也会被删除<br />`app/models/user.rb`

```ruby
class User < ActiveRecord::Base
  attr_accessible :name, :email, :password, :password_confirmation
  has_secure_password
  has_many :microposts, dependent: :destroy
  .
  .
  .
end
```

上面代码中有这么一行：

```ruby
has_many :microposts, dependent: :destroy
```

其中的 `dependent: :destroy` 只是程序在用户被删除的时候，其所属的微博也要被删除。这么一来，如果管理员删除了用户，数据库中就不会出现无主的微博了。

至此，用户和微博之间的关联就设置好了，所有的测试应该都可以通过了：

```sh
$ bundle exec rspec spec/
```

<h3 id="sec-10-1-5">10.1.5 验证微博内容</h3>

在结束讨论微博模型之前，我们还要为微博的内容加上数据验证（参照 [2.3.2 节](chapter2.html#sec-2-3-2)）。和 `user_id` 一样，`content` 属性不能为空，而且还要限制内容的长度不能多于 140 个字符，这才是真正的“微”博。我们要编写的测试和 [6.2 节](chapter6.html#sec-6-2)中对用户模型的验证测试类似，如代码 10.17 所示。

**代码 10.17** 测试微博模型的数据验证<br />`spec/models/micropost_spec.rb`

```ruby
require 'spec_helper'

describe Micropost do

  let(:user) { FactoryGirl.create(:user) }
  before { @micropost = user.microposts.build(content: "Lorem ipsum") }
  .
  .
  .
  describe "when user_id is not present" do
    before { @micropost.user_id = nil }
    it { should_not be_valid }
  end

  describe "with blank content" do
    before { @micropost.content = " " }
    it { should_not be_valid }
  end

  describe "with content that is too long" do
    before { @micropost.content = "a" * 141 }
    it { should_not be_valid }
  end
end
```

和 [6.2 节](chapter6.html#sec-6-2)一样，在代码 10.17 中我们用到了字符串乘积来测试微博内容长度的验证：

```sh
$ rails console
>> "a" * 10
=> "aaaaaaaaaa"
>> "a" * 141
=> "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
```

我们要在程序中加入下面这行代码：

```ruby
validates :content, presence: true, length: { maximum: 140 }
```

微博模型的最终代码如代码 10.18 所示。

**代码 10.18** 微博模型的数据验证<br />`app/models/micropost.rb`

```ruby
class Micropost < ActiveRecord::Base
  attr_accessible :content

  belongs_to :user

  validates :content, presence: true, length: { maximum: 140 }
  validates :user_id, presence: true

  default_scope order: 'microposts.created_at DESC'
end
```

<h2 id="sec-10-2">10.2 显示微博</h2>

尽管我们还没实现直接在网页中发布微博的功能（将在 [10.3.2 节](#sec-10-3-2)实现），不够我们还是有办法能够显示微博，并对显示的内容进行测试。我们将按照 Twitter 的方式，用户的微博不在 `index` 页面中显示，而在 `show` 页面中，构思图如图 10.4 所示。我们会先创建一些很简单的 ERb 代码，在用户的资料页面显示微博，然后要在 [9.3.2 节](chapter9.html#sec-9-3-2)中实现的数据生成器中加入生成微博的代码，这样我们才有内容可以显示。

![user microposts mockup bootstrap](images/figures/user_microposts_mockup_bootstrap.png)

图 10.4：显示了微博的资料页面构思图

和 [8.2.1 节](chapter8.html#sec-8-2-1)中对登录机制的介绍类似，[10.2.1 节](#sec-10-2-1)节会经常将一些元素推送到[堆栈]()http://en.wikipedia.org/wiki/Stack_(data_structure))里，然后再一个一个的从栈尾取出来。如果你理解起来有点困难，多点耐心，你的付出在 [10.2.2 节](#sec-10-2-2)会得到回报的。

<h3 id="sec-10-2-1">10.2.1 </h3>

我们现在用户的 request spec 中加入对显示微博的测试。我们采用的方法是，先通过预构件创建几篇微博，然后检查用户资料页面是否显示了这几篇微博，同时我们还要验证是否显示了如图 10.4 中所示的总的微博数量。

创建微博我们可以使用 `let` 方法，不过如代码 10.13 所示，我们希望用户和微博的关联立即生效，这样微博才能显示在用户的资料页面中。所以，我们要使用 `let!` 方法：

```ruby
let(:user) { FactoryGirl.create(:user) }
let!(:m1) { FactoryGirl.create(:micropost, user: user, content: "Foo") }
let!(:m2) { FactoryGirl.create(:micropost, user: user, content: "Bar") }

before { visit user_path(user) }
```

按照上面这种方式定义了微博后，我们就可以使用代码 10.19 中的代码测试用户资料页面中是否显示了这些微博。

**代码 10.19** 检测用户资料页面是否显示了微博的测试<br />`spec/requests/user_pages_spec.rb`

```ruby
require 'spec_helper'

describe "User pages" do
  .
  .
  .
  describe "profile page" do
    let(:user) { FactoryGirl.create(:user) }
    let!(:m1) { FactoryGirl.create(:micropost, user: user, content: "Foo") }
    let!(:m2) { FactoryGirl.create(:micropost, user: user, content: "Bar") }

    before { visit user_path(user) }

    it { should have_selector('h1',    text: user.name) }
    it { should have_selector('title', text: user.name) }

    describe "microposts" do
      it { should have_content(m1.content) }
      it { should have_content(m2.content) }
      it { should have_content(user.microposts.count) }
    end
  end
  .
  .
  .
end
```

注意，我们可以在关联关系的方法上调用 `count` 方法：

```ruby
user.microposts.count
```

这个 `count` 方法是很聪明的，可以直接在数据库层统计数量。也就是说，`count` 的计数过程不是微博从数据库中取出来，然后再在所得的数组上调用 `length` 方法，如果这样做的话，微博数量一旦很多的话，效率就会很低。其实，`count` 方法会直接在数据库层中统计用户 user_id` 的微博数量。如果统计数量仍然是你的程序的性能瓶颈的话，你可以使用“[计数缓存](http://railscasts.com/episodes/23-counter-cache-column)”进一步提速。

在加入代码 10.21 之前，代码 10.19 中的测试是无法通过的，不过现在我们可以现在用户的资料页面中加入一些微博，如代码 10.20 所示。

**代码 10.20** 在用户资料页面中加入微博<br />`app/views/users/show.html.erb`

```erb
<% provide(:title, @user.name) %>
<div class="row">
  .
  .
  .
  <aside>
    .
    .
    .
  </aside>
  <div class="span8">
    <% if @user.microposts.any? %>
      <h3>Microposts (<%= @user.microposts.count %>)</h3>
      <ol class="microposts">
        <%= render @microposts %>
      </ol>
      <%= will_paginate @microposts %>
    <% end %>
  </div>
</div>
```

微博列表稍后分析，现在先看看其他部分。在这段代码中，使用 `if @user.microposts.any?`（在代码 7.23 中见过类似的用法）的作用是，如果用户没有发布微博的话，就不会显示后面的列表。

还要注意一下，在代码 10.20 中我们也加入了微博的分页显示功能：

```erb
<%= will_paginate @microposts %>
```

如果你和用户索引页面中对应的代码（参见代码 9.34）比较的话，会发现，之前所用的代码是：

```erb
<%= will_paginate %>
```

之前直接调用之所以可以使用，是因为在 Users 控制器中，`will_paginate` 默认存在一个名为 `@users` 的变量（在 [9.3.3 节](chapter9.html#sec-9-3-3)中介绍过，该变量的值必须是 `AvtiveRecord::Relation` 的实例）。现在，对然我们还在 Users 控制器中，但是我们要对**微博**分页，所以 `will_paginate` 方法要指定 `@microposts` 变量作为参数。当然了，我们还要在 `show` 动作中定义 `@microposts` 变量（参见代码 10.22）。

接着，我们还显示了当前微博的数量：

```erb
<h3>Microposts (<%= @user.microposts.count %>)</h3>
```

前面介绍过，`@user.microposts.count` 的作用和 `User.count` 类似，不过统计的微博数量却是建立在用户和微博的关联关系上的。

最后，我们来看一下显示微博的列表：

```erb
<ol class="microposts">
  <%= render @microposts %>
</ol>
```

这段代码使用了一个有序列表标签 `ol`，显示一个微博列表，不过关键的部分是通过一个微博局部视图实现的。在 [9.3.4 节](chapter9.html#sec-9-3-4)中介绍过，如下的代码

```erb
<%= render @users %>
```

会使用名为 `_user.html.erb` 的局部视图渲染 `@users` 变量中的每一个用户。因此，如下的代码

```erb
<%= render @microposts %>
```

会对微博最同样的渲染操作。所以，我们要创建名为 `_micropost.html.erb` 的局部视图（存放在微博对应的视图文件夹中），如代码 10.21 所示。

**代码 10.21** 显示单篇微博的局部视图<br />`app/views/microposts/_micropost.html.erb`

```erb
<li>
  <span class="content"><%= micropost.content %></span>
  <span class="timestamp">
    Posted <%= time_ago_in_words(micropost.created_at) %> ago.
  </span>
</li>
```

这段代码使用了 `time_ago_in_words` 帮助方法，会在 [10.2.2 节](#sec-10-2-2)中介绍。

至此，尽管定义了所需的全部视图，但是代码 10.19 中的测试仍旧无法通过，提示未定义 `@microposts` 变量。加入代码 10.22 中的代码后，测试就可以通过了。

**代码 10.22** 在 Users 控制器的 `show` 动作中加入 `@microposts` 实例变量<br />`app/controllers/users_controller.rb`

```ruby
class UsersController < ApplicationController
  .
  .
  .
  def show
    @user = User.find(params[:id])
    @microposts = @user.microposts.paginate(page: params[:page])
  end
end
```

请注意一下 `paginate` 方法是多么的智能，它甚至可以通过关联关系，在 `microposts` 数据表中取出每个分页中要显示的微博。

现在，我们可以查看一下刚编好的用户资料页面了，如图 10.5 所示，可能会出乎你的意料，这也是理所当然的，因为我们还没有发布微博呢。下面我们就来发布微博。

![user profile no microposts bootstrap](assets/images/figures/user_profile_no_microposts_bootstrap.png)

图 10.5：添加了显示微博代码后的用户资料页面，不过还没有微博可显示

<h3 id="sec-10-2-2">10.2.2 示例微博</h3>

在 [10.2.1 节](#sec-10-2-1)中为了显示微博，创建了几个视图，但是结果有点不给力。为了改变这个悲剧，我们要在 [9.3.2 节](chapter9.html#sec-9-3-2)中用到的示例数据生成器中加入生成微博数据的代码。如果给所有的用户都生成一些微博的话要用很长的时间，所以我们暂且只给前六个用户<sup>[4](#fn-4)</sup>生成微博数据，这要用到 `User.all` 方法的 `:limit` 选项：<sup>[5](#fn-5)</sup>

```ruby
users = User.all(limit: 6)
```

我们要为每个用户生成 50 篇微博（这个数量大于单页显示的 30 篇限制），使用 Faker gem 中简便的 `Lorem.sentence` 方法生成每篇微博的内容。（`Faker::Lorem.sentence` 生成的是 lorem ipsum 示例文字，我们在[第 6 章](chapter6.html)中介绍过，lorem ipsum 背后有一段[有趣的故事](http://www.straightdope.com/columns/read/2290/what-does-the-filler-text-lorem-ipsum-mean)。）代码 10.23 中显示的是修改后的示例数据生成器。

**代码 10.23** 在示例数据生成器中加入生成微博的代码<br />`lib/tasks/sample_data.rake`

```ruby
namespace :db do
  desc "Fill database with sample data"
  task populate: :environment do
    .
    .
    .
    users = User.all(limit: 6)
    50.times do
      content = Faker::Lorem.sentence(5)
      users.each { |user| user.microposts.create!(content: content) }
    end
  end
end
```

当然，如果要生成示例数据，我们要执行 `db:populate` 命令：

```sh
$ bundle exec rake db:reset
$ bundle exec rake db:populate
$ bundle exec rake db:test:prepare
```

然后，我们就能看到 [10.2.1 节](#sec-10-2-1)中劳动的果实了，在用户资料页面显示了生成的微博。<sup>[6](#fn-6)</sup>初步结果如图 10.6 所示。

![user profile microposts no styling bootstrap](assets/images/figures/user_profile_microposts_no_styling_bootstrap.png)

图 10.6：用户资料页面（[/users/1](http://localhost/users/1)）中显示的尚未样式化的微博列表

图 10.6 中显示的微博列表还没有加入样式，那我们就加入一些样式（参见代码 10.24）<sup>[7](#fn-7)</sup>，再看一下页面显示的效果.图 10.7 显示的是第一个用户（当前登录用户）的资料页面，图 10.8 显示的是另一个用户的资料页面，图 10.9 显示的是第一个用户资料页面的第 2 页，页面底部还显示了分页链接。注意观察这三幅图，我们可以看到微博后面显示了距离发布的时间（例如，“Posted 1 minute ago.”），这个效果是通过代码 10.21 中的 `time_ago_in_words` 方法实现的。过一会再刷新页面，你会发现这些文字依据当前时间自动更新了。

**代码 10.24** 微博列表的样式（包含了本章用到的所有样式）<br />`app/assets/stylesheets/custom.css.scss`

```scss
.
.
.

/* microposts */

.microposts {
  list-style: none;
  margin: 10px 0 0 0;

  li {
    padding: 10px 0;
    border-top: 1px solid #e8e8e8;
  }
}
.content {
  display: block;
}
.timestamp {
  color: $grayLight;
}
.gravatar {
  float: left;
  margin-right: 10px;
}
aside {
  textarea {
    height: 100px;
    margin-bottom: 5px;
  }
}
```

![user profile with microposts bootstrap](assets/images/figures/user_profile_with_microposts_bootstrap.png)

图 10.7：显示了微博的用户资料页面（[/users/1](http://localhost:3000/users/1)）

![other profile with microposts bootstrap](assets/images/figures/other_profile_with_microposts_bootstrap.png)

图 10.8：另一个用户的资料页面，也显示了微博列表（[/users/5](http://localhost:3000/users/5)）

![user profile microposts page 2 rails3 bootstrap](assets/images/figures/user_profile_microposts_page_2_rails_3_bootstrap.png)

图 10.9：微博分页链接（[/users/1?page=2](http://localhost:3000/users/1?page=2)）

<h2 id="sec-10-2">10.2 微博相关的操作</h2>

微博的数据模型构建好了，也编写了相关的视图文件，接下来我们的开发重点是，通过网页发布微博。这实现的过程中，我们会第三次用到表单来创建资源，这一次创建的是微博资源<sup>[8](#fn-8)</sup>。本节，我们还会初步实现状态 Feed（status feed），在[第 11 章](chapter11.html)再完善。最后，和用户资源类似，我们还要实现在网页中删除微博的功能。

上述功能的实现和之前的惯例有一点是不一样的，需要特别注意，那就是，微博资源相关的页面不是通过 Microposts 控制器实现的，而是依赖于 Users 和 StaticPages 控制器。这也就意味着，微博资源的路由设置是很简单的，如代码 10.25 所示。代码 10.25 中的代码所代表的符合 REST 结构的路由如[表格 10.2](#table-10-2) 所示，表中的路由只是[表格 2.3](chapter2.html#table-2-3) 的一部分。不过，路由虽然简化了，但预示着实现的过程需要更高级的技术，而不会减小代码的复杂度。从[第 2 章](chapter2.html)起我们就十分依赖脚手架，不过现在我们将舍弃脚手架的大部分功能。

**代码 10.25** 微博资源的路由设置<br />`config/routes.rb`

```ruby
SampleApp::Application.routes.draw do
  resources :users
  resources :sessions,   only: [:new, :create, :destroy]
  resources :microposts, only: [:create, :destroy]
  .
  .
  .
end
```

<table id="table-2" class="tabular">
  <tbody>
    <tr>
      <th class="align_left"><strong>HTTP request</strong></th>
      <th class="align_left"><strong>URI</strong></th>
      <th class="align_left"><strong>Action</strong></th>
      <th class="align_left"><strong>Purpose</strong></th>
    </tr>
    <tr class="top_bar">
      <td class="align_left"><tt>POST</tt></td>
      <td class="align_left">/microposts</td>
      <td class="align_left"><code>create</code></td>
      <td class="align_left">create a new micropost</td>
    </tr>
    <tr>
      <td class="align_left"><tt>DELETE</tt></td>
      <td class="align_left">/microposts/1</td>
      <td class="align_left"><code>destroy</code></td>
      <td class="align_left">delete micropost with id <code>1</code></td>
    </tr>
  </tbody>
</table>

表格 10.2：代码 10.25 设置的微博资源路由

<h3 id="sec-10-3-1">10.3.1 访问限制</h3>

开发微博资源的第一步，我们要在微博控制器中实现访问限制。我们要实现的效果很简单：若要访问 `create` 和 `destroy` 动作就要先登录。针对访问限制的 RSpec 测试如代码 10.26 所示。（在 [10.3.4 节](#sec-10-3-4)中，我们还会测试并加入第三层保护措施，确保只有微博的发布者才能删除该微博。）

**代码 10.26** 限制访问微博资源的测试<br />`spec/requests/authentication_pages_spec.rb`

```ruby
require 'spec_helper'

describe "Authentication" do
  .
  .
  .
  describe "authorization" do

    describe "for non-signed-in users" do
      let(:user) { FactoryGirl.create(:user) }
      .
      .
      .
      describe "in the Microposts controller" do

        describe "submitting to the create action" do
          before { post microposts_path }
          specify { response.should redirect_to(signin_path) }
        end

        describe "submitting to the destroy action" do
          before { delete micropost_path(FactoryGirl.create(:micropost)) }
          specify { response.should redirect_to(signin_path) }
        end
      end
      .
      .
      .
    end
  end
end
```

上述代码没有使用即将实现的网页界面，而是直接在微博控制器层面操作：如果向 /microposts 发送 POST 请求（`POST microposts_path` 访问的是 `create` 动作），或者向 /microposts/1 发送 DELETE 请求（`delete micropost_path(micropost)` 访问的是 `destroy` 动作），则会转向登录页面——我们在代码 9.14 中就用过这种方法。

我们要先对程序的代码做点重构，然后再加入程序中，让代码 10.26 中的测试通过。在 [9.2.1 节](chapter9.html#sec-9-2-1)中，我们定义了一个名为 `signed_in_user` 的事前过滤器（参见代码 9.12），确保访问相关的动作之前用户要先登录。那时，我们只需要在 Users 控制器中使用这个事前过滤器，但是现在我们在 Microposts 控制器中也要用到，那么我们就把它移到 Sessions 的帮助方法中，如代码 10.27 所示。<sup>[9](#fn-9)</sup>

**代码 10.27** 把 `signed_in_user` 方法移到 Sessions 帮助方法中<br />`app/helpers/sessions_helper.rb`

```ruby
module SessionsHelper
  .
  .
  .
  def current_user?(user)
    user == current_user
  end

  def signed_in_user
    unless signed_in?
      store_location
      redirect_to signin_url, notice: "Please sign in."
    end
  end
  .
  .
  .
end
```

为了避免代码重复，同时还要把 `signed_in_user` 从 Users 控制器中删掉。

加入了代码 10.27 之后，我们就可以在 Microposts 控制器中使用 `signed_in_user` 方法了，因此我们就可以使用代码 10.28 中的事前过滤器来限制访问 `create` 和 `destroy` 动作了。（因为我们没有使用命令行生成 Microposts 控制器文件，因此需要手动创建。）

**代码 10.28** 在 Microposts 控制器中加入访问限制功能<br />`app/controllers/microposts_controller.rb`

```ruby
class MicropostsController < ApplicationController
  before_filter :signed_in_user

  def create
  end

  def destroy
  end
end
```

注意，我们没有明确指定事前过滤器要限制的动作有哪几个，因为默认情况下仅有的两个动作都会被限制。如果我们要加入第三个动作，例如 `index` 动作，未登录的用户也可以访问，那么我们就要明确的指定要限制的动作了：

```ruby
class MicropostsController < ApplicationController
  before_filter :signed_in_user, only: [:create, :destroy]

  def index
  end

  def create
  end

  def destroy
  end
end
```

现在，测试应该可以通过了：

```sh
$ bundle exec rspec spec/requests/authentication_pages_spec.rb
```

<h3 id="sec-10-3-2">10.3.2 发布微博</h3>

