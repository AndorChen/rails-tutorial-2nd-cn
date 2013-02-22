---
layout: chapter
title: 第十一章 关注用户
---

在这一章中，我们会在现有程序的基础上增加社交功能，允许用户关注（follow）或取消关注其他人，并在用户主页上显示其所关注用户的微博更新。我们还会创建两个页面用来显示关注的用户列表和粉丝列表。我们将会在 [11.1 节](#sec-11-1)学习如何构建用户之间的模型关系，随后在 [11.2 节](#sec-11-2)设计网页界面，同时还会介绍 Ajax。最后，我们会在 [11.3 节](#sec-11-3)实现一个完整的动态列表。

这是本书最后一章，其中会包含了一些本教程中最具有挑战性的内容，为了实现动态列表，我们会使用一些 Ruby/SQL 小技巧。 通过这些例子，你会了解到 Rails 是如何处理更加复杂的数据模型的，而这些知识会在你日后开发其他应用时发挥作用。 为了帮助你平稳地从教程学习到独立开发过渡，在 [11.4 节](#sec-11-4)我们推荐了几个可以在已有微博核心基础上开发的额外功能，以及一些进阶资料的链接。

和之前章节一样，Git 用户应该创建一个新的分支：

```sh
$ git checkout -b following-users
```

因为本章的内容比较有挑战性，在开始编写代码之前，我们先来思考一下网站的界面。 和之前的章节一样，在开发的早期阶段我们会通过构思图来呈现页面。<sup>[1](#fn-1)</sup> 完整的页面流程是这样的：一名用户 (John Calvin) 从他的个人资料页面（如图 11.1 ）浏览到用户索引页面（如图 11.2），关注了一个用户。Calvin 打开另一个用户 Thomas Hobbes 的个人主页（如图 11.3），点击“Follow（关注）”按钮 关注该用户，然后，这个“Follow”按钮会变为“Unfollow（取消关注）” ，而且 Hobbes 的关注人数会增加 1 个（如图 11.4）。接着，Calvin 回到自己的主页，看到关注人数增加了 1 个，在动态列表中也能看到 Hobbes 的状态更新（如图 11.5）。接下来的整章内容就是要实现这样的页面流程。

![page flow profile mockup bootstrap](assets/images/figures/page_flow_profile_mockup_bootstrap.png)

图 11.1：当前登入用户的个人资料页面

![page flow user index mockup bootstrap](assets/images/figures/page_flow_user_index_mockup_bootstrap.png)

图 11.2：寻找一个用户来关注

![page flow other profile follow button mockup bootstrap](assets/images/figures/page_flow_other_profile_follow_button_mockup_bootstrap.png)

图 11.3：一个想要关注的用户资料页面，显示有关注按钮

![page flow other profile unfollow button mockup bootstrap](assets/images/figures/page_flow_other_profile_unfollow_button_mockup_bootstrap.png)

图 11.4：关注按钮变为取消关注的同时，关注人数增加了 1 个

![page flow home page feed mockup bootstrap](assets/images/figures/page_flow_home_page_feed_mockup_bootstrap.png)

图 11.5：个人主页出现了新关注用户的微博，关注人数增加了 1 个

<h2 id="sec-11-1">11.1 关系模型</h2>

为了实现关注用户这一功能，第一步我们要做的是创建一个看上去并不是那么直观的数据模型。一开始我们可能会认为一个 `has_many` 的数据关系会满足我们的要求：一个用户可以关注多个用户，同时一个用户还能被多个用户关注。但实际上这种关系存在问题的，下面我们就来学习如何使用 `has_many through` 来解决这个问题。本节很多功能的实现初看起来都有点难以理解，你需要花一点时间思考，才能真正搞清楚这样做的原因。如果在某个地方卡住了，尝试着先往后读，然后在把本节读一遍，看一下刚才卡住的地方想明白了没。

<h3 id="sec-11-1-1">11.1.1 数据模型带来的问题(以及解决方式) </h3>

构造数据模型的第一步，我们先来看一个典型的情况。假如一个用户关注了另外一个用户，比如 Calvin 关注了 Hobbes，也就是 Hobbes 被 Calvin 关注了，那么 Calvin 就是关注者（follower），而 Hobbes 则是被关注者( followed )。按照 Rails 默认的复数表示习惯， 我们称关注某一特定用户的用户集合为该用户的 followers，`user.followers` 就是这些用户组成的数组。不过，当我们颠倒一下顺序，上述关系则不成立了：默认情况下，所有被关注的用户称之为 followeds，这样说在英语语法上并不通顺恰当。我们可以称被关注者为 following，但这个词有些歧义：在英语里，"following" 指关注你的人，和我们想表达的恰恰相反。考虑到上述两种情况，尽管我们将使用“following”作为标签，如“50 following, 75 followers”, 但在数据模型中会使用“followed users”表示我们关注的用户集合，以及一个对应的 `user.followed_users` 数组。<sup>[2](#fn-2)</sup>

经过上述的讨论，我们会按照图 11.6 的方式构建被关注用户的模型，使用 `followed_users` 表实现一对多(`has_many`)关联。由于 `user.followed_users` 应该是一个用户对象组成的数组，所以 `followed_users` 表中的每一行应该对应一个用户，并且指定 `followed_id` 列，和其他用户建立关联。<sup>[3](#fn-3)</sup>除此之外，由于每一行均对应一个用户，所以我们还要在表中加入用户的其他属性，包括名字，密码等。

![naive user has many followed users](assets/images/figures/naive_user_has_many_followed_users.png)

图 11.6：一个简单的用户互相关注实现

图 11.6 中描述的数据模型仍存在一个问题，那就是存在非常多的冗余，每一行不仅包括了所关注用户的 id, 还包括了他们的其他信息，而这些信息在 `users` 表中都有。 更糟糕的是，为了建立关注用户的数据模型，我们还需要一个单独的，同样冗余的 `followers` 表。这最终将导致数据模型极难维护，每当用户修改姓名时，我们不仅要修改用户在 `users` 表中的数据，还要修改 `followed_users` 和 `followers` 表中对应该用户的每一个记录。

造成这个问题的主要原因是，我们缺少了一层抽象。 找到合适抽象的一个方法是，思考我们会如何在应用程序中实现关注用户的操作。在 [7.1.2 节](chapter7.html#sec-7-1-2)中我们介绍过，REST 架构涉及到创建资源和销毁资源两个过程。 由此引出两个问题： 当用户关注另一个用户时，创建了什么？ 当用户取消关注另一个用户是，销毁了什么？

按照 REST 架构的思路再次思考之后，我们会发现，在关注用户的过程中，被创建和被销毁的是两个用户之间的“关系”。在这种“关系”中，一个用户有多个“关系”（`has_many :relationships`），并有很多关注的用户（`followed_users` 或 `followers`)。其实，在图 11.6 中我们已经基本实现了这种“关系”： 由于每一个被关注的用户都是由 `followed_id` 独一无二的标识出来的，我们就可以将 `followed_users` 表转化成 `relationships` 表，删掉用户的详细资料，使用 `followed_id` 从 `users` 表中获得被关注用户的数据。 同样的，这种“关系”反过来，我们可以使用 `follower_id` 获取所有粉丝组成的数组。

为了得到一个由所有被关注用户组成的 `followed_users` 数组，我们可以先获取由 `followed_id` 属性组成的数组，再查找每个用户。不过，如你所想，Rails 为我们提供了一种更简单的方式，那就是 `has_many through`。我们将在 [11.1.4 节](#sec-11-1-4)介绍， Rails 允许我们使用下面这行清晰简洁的代码，通过 `relationships` 表来描述一个用户关注了很多其他用户：

```ruby
has_many :followed_users, through: :relationships, source: "followed_id"
```

这行代码会自动获取被关注用户组成的数组，也就是 `user.followed_users`。 图11.7 描述了这个数据模型。

![user has many followed users](assets/images/figures/user_has_many_followed_users.png)

图 11.7：通过 `relationships` 表建立的被关注用户数据模型

下面让我们动手实现，首先我们通过下面的命令创建 Relationship 模型：

```sh
$ rails generate model Relationship follower_id:integer followed_id:integer
```

由于我们需通过 `follower_id` 和 `followed_id` 来查找用户之间的关系，考虑到性能，要为这两列加上索引， 如代码 11.1 所示。

**代码 11.1** 在 `relationships` 表中设置索引<br />`db/migrate/[timestamp]_create_relationships.rb`

```ruby
class CreateRelationships < ActiveRecord::Migration
  def change
    create table :relationships do |t|
      t.integer :follower id
      t.integer :followed id
      t.timestamps
  end

  add index :relationships, :follower id
  add index :relationships, :followed id
  add index :relationships, [:follower id, :followed id], unique: true
  end
end
```

在代码 11.1 中，我们还设置了一个组合索引（composite index），其目的是确保 (`follower_id, followed_id`) 组合是唯一的，这样用户就无法多次关注同一个用户了 (可以和代码 6.22 中为保持 Email 地址唯一的 index 做比较一下)：

```ruby
￼add index :relationships, [:follower id, :followed id], unique: true
```

从 [11.1.4 节](#sec-11-1-4)开始，我们会发现，在用户界面中这样的事情是不会发生的，但是添加了组合索引后，如果用户试图二次关注时，程序会抛出异常（例如，使用像 `curl` 正阳的命令行程序）。我们也可以在 Relationship 模型中添加唯一性数据验证，但因为每次尝试创建一个重复关系时都会触发错误，所以这个组合索引足以满足我们的需求了。


为了创建 `relationships` 表，和之前一样，我们要先执行数据库迁移，再准备好“测试数据库”：

```sh
￼$ bundle exec rake db:migrate
$ bundle exec rake db:test:prepare
```

得到的 Relationship 数据模型如图 11.8 所示。

![relationship model](assets/images/figures/relationship_model.png)

图 11.8：Relationship 数据模型

<h3 id="sec-11-1-2">11.1.2 User 和 Relationship 模型之间的关联</h3>

在着手实现已关注用户和关注者之前，我们先要建立 User 和 Relationship 模型之间的关联关系。一个用户可以有多个“关系”（`has_many` relationships）, 因此一个“关系”涉及到两个用户，所以这个“关系”就同时属于（`belongs_to`）该用户和被关注者。

和 [10.1.3 节](chapter10.html#sec-10-1-3)创建微博一样，我们将通过 User 和 Relationship 模型之间的关联来创建这个“关系”，使用如下的代码实现：

```ruby
user.relationships.build(followed_id: ...)
```

首先，我们来编写测试，如代码 11.2 所示，我们声明了 `relationship` 变量，检查其是否合法，再确认 `follower_id`列是无法访问的。（如果检查可访问属性的测试没有失败，请检查你的 `application.rb` 是否已经按照代码 10.6 做了修改。）

**代码 11.2** 测试建立“关系”以及属性的可访问性<br />`spec/models/relationship_spec.rb`

```ruby
require 'spec helper' describe Relationship do
  let(:follower) { FactoryGirl.create(:user) }
  let(:followed) { FactoryGirl.create(:user) }
  let(:relationship) { follower.relationships.build(followed id: followed.id) }

  subject { relationship }
  it { should be_valid }

  describe "accessible attributes" do
    it "should not allow access to follower id" do
      expect do
        Relationship.new(follower id: follower.id)
      end.should raise_error(ActiveModel::MassAssignmentSecurity::Error)
    end
  end
end
```

这里需要注意，与测试 User 和 Micropost 模型时使用 `@user` 和 `@micropost` 不同，代码 11.2 中使用 `let` 代替了实例变量。这两种方式之间几乎没有差别<sup>[4](#fn-4)</sup>，但我认为使用 `let` 相对于使用实例变量更易懂。测试 User 和 Micropost 时之所以使用实例变量，是希望读者早些接触这个重要的概念，而 `let` 则略显高深，所以我们放在这里才用。

同时，在 User 模型中我们还要测试用户对象是否可以响应 `relationships` 方法，如代码 11.3 所示。

**代码 11.3** 测试 `user.relationships`<br />`spec/models/user_spec.rb`

```ruby
require 'spec helper'
describe User do .
  .
  .
  it { should respond_to(:feed) }
  it { should respond_to(:relationships) } .
  .
  .
end
```

此时，你可能会想在程序中中加入类似于 [10.1.3 节](chapter10.html#sec-10-1-3)中用到的代码，我们要添加的代码却是很像，但二者之间有一处很不一样：在 Micropost 模型中， 我们使用

```ruby
class Micropost < ActiveRecord::Base
  belongs_to :user
  .
  .
  .
end
```

和

```ruby
class User < ActiveRecord::Base
  has_many :microposts
  .
  .
  .
end
```

因为 `microposts` 表中存有 `user_id` 属性，可以标示用户（参见 [10.1.1 节](chapter10.html#sec-10-1-1)）。这种连接两个数据表的 id，我们称之为外键（foreign key），当指向 User 模型的外键为 `user_id` 时，Rails 就会自动的获知关联关系，因为默认情况下，Rails 会寻找 `<class>_id` 形式的外键，其中 `<class>` 是模型类名的小写形式。<sup>[5](#fn-5)</sup>现在，尽管我们处理的还是用户，但外键是 `follower_id` 了，所以我们要告诉 Rails 这一变化，如代码 11.4 所示。<sup>[6](#fn-6)</sup>

**代码 11.4** 实现 User 和 Relationship 模型之间 `has_many` 的关联关系<br />`app/models/user.rb`

```ruby
class User < ActiveRecord::Base
  .
  .
  .
  has_many :microposts, dependent: :destroy
  has_many :relationships, foreign_key: "follower_id", dependent: :destroy
  .
  .
  .
```

（由于删除用户后，也应该删除该用户的所有“关系”， 于是我们指定了 `dependent: :destroy` 参数；针对删除效果的测试会留作练习，参见 [11.5 节](#sec-11-5)。）

和 Micropost 模型一样，Relationship 模型和 User 模型之间也有一层 `belongs_to` 关系，此时，这种关系同时属于关注着和被关注着，针对这层“关系”的测试如代码 11.5 所示。

**代码 11.5** 测试 User 和 Relationship 模型之间的 `belongs_to` 关系<br />`spec/models/relationship_spec.rb`

```ruby
describe Relationship do .
  .
  .
  describe "follower methods" do
    it { should respond_to(:follower) }
    it { should respond_to(:followed) }
    its(:follower) { should == follower }
    its(:followed) { should == followed }
  end
end
```

下面我们开始写程序的代码，`belongs_to` 关系的建立和之间一样。Rails 会通过 Symbol 获知外键的名字（例如，`:follower` 对应的外键是 `follower_id`，`:followed` 对应的外键是 `followed_id`），但 Followed 或 Follower 模型是不存在的，因此这里就要使用 `User` 这个类名， 如代码 11.6 所示。注意，与默认生成的 Relationship 模型不同，这里只有 `followed_id` 是可以访问的。

**代码 11.6** 为 Relationship 模型添加 `belongs_to` 关系<br />`spec/models/relationship_spec.rb`

```ruby
class Relationship < ActiveRecord::Base
  attr_accessible :followed_id

  belongs_to :follower, class_name: "User"
  belongs_to :followed,class_name: "User"
end
```

尽管直到 [11.1.5 节](#sec-11-1-5)我们才会用到 `followed` 关联，但同时实现 follower 和 followed 关联会更容易理解。

此时，代码 11.2 和代码 11.3 中的测试应该可以通过了。

```sh
$ bundle exec rspec spec/
```

<h3 id="sec-11-1-3">11.1.3 数据验证</h3>

在结束这部分之前，我们将添加一些阵对 Relationship 模型的数据验证，确保代码的完整性。测试（代码 11.7）和程序代码（代码 11.8）都非常易懂。

**代码 11.7** 测试 Relationship 模型的数据验证<br />`spec/models/relationship_spec.rb`

```ruby
describe Relationship do .
  .
  .
  describe "when followed id is not present" do
    before { relationship.followed id = nil }
    it { should not be valid }
  end

  describe "when follower id is not present" do
    before { relationship.follower_id = nil }
    it { should_not be_valid }
  end
end
```

**列表 11.8** 添加 Relationship 模型数据验证<br />`app/models/relationship.rb`

```ruby
class Relationship < ActiveRecord::Base   attr accessible :followed id

  belongs_to :follower, class_name: "User"
  belongs_to :followed, class_name: "User"

  validates :follower_id, presence: true
  validates :followed_id, presence: true

end
```

<h3 id="sec-11-1-4">11.1.4 被关注的用户</h3>

下面到了 Relationship 关联关系的核心部分了：`followed_users` 和 `followers`。 我们首先从 `followed_users` 开始，测试如代码 11.9 所示。

**列表 11.9** 测试 `user.followed_users` 属性<br />`spec/models/user_spec.rb`

```ruby
require 'spec helper'
describe User do .
  .
  .
  it { should respond_to(:relationships) }
  it { should respond_to(:followed_users) } .
  .
  .
end
```

实现的代码会第一次使用 `has_many through`：用户通过 `relationships` 表拥有多个关注关系，就像图 11.7 所示的那样。默认情况下，在 `has_many through` 关联中，Rails 会寻找关联名单数形式对应的外键，也就是说，像下面的代码

```ruby
has_may :followeds, through: :relationships
```

会使用 `relationships` 表中的 `followed_id` 列生成一个数组。但是，正如在 [11.1.1 节](#sec-11-1-1)中说过的，`user.followeds` 这种说法比较蹩脚，若使用“followed users”作为 “followed”的复数形式会好得多，那么被关注的用户数组就要写成 `user.followed_users` 了。Rails 当然会允许我们重写默认的设置，针对本例，我们可以使用 `:source` 参数告知 Rails `followed_users` 数组的来源是 `followed` 所代表的 id 集合。

**列表 11.10** 在 User 模型中添加 `followed_users` 关联<br />`app/models/user.rb`

```ruby
class User < ActiveRecord::Base .
  .
  .
  has_many :microposts, dependent: :destroy
  has_many :relationships, foreign_key: "follower_id", dependent: :destroy
  has_many :followed_users, through: :relationships, source: :followed
  .
  .
  .
end
```

为了创建关注关联关系，我们将定义一个名为 `follow!` 的方法，这样我们就能使用 `user.follow!(other_user)` 这样的代码创建关注了。（`follow!` 方法应该与 `create!` 和 `save!` 方法一样，失败时抛出异常，所以我们在后面加上了感叹号。）对应地，我们还会添加一个 `following?` 布尔值方法，检查一个用户是否关注另一个用户。<sup>[7](#fn-7)</sup>代码 11.11 中的测试表明了我们希望如何使用这两个方法。

**列表 11.11** 测试关注关系用到的方法<br />`spec/models/user_spec.rb`

```ruby
require 'spec helper'

  describe User do .
  .
  .
  it { should respond_to(:followed_users) }
  it { should respond_to(:following?) }
  it { should respond_to(:follow!) }
  .
  .
  .
  describe "following" do
  let(:other_user) { FactoryGirl.create(:user) }
  before do
    @user.save
    @user.follow!(other_user)
  end

  it { should be_following(other_user) }
  its(:followed_users) { should include(other_user) } end
end
```

在实现的代码中，`following` 方法接受一个用户对象作为参数，参数名为 `other_user`，检查这个被关注者的 id 在数据库中是否存在；`follow!` 方法直接调用 `create!` 方法，通过和 Relationship 模型的关联来创建关注关系，如代码 11.12 所示。

**代码 11.12** 定义 `following?` 和 `follow!` 方法<br />`app/models/user.rb`

```ruby
class User < ActiveRecord::Base .
    .
    .
    def feed
    .
    .
    .
    end

    def following?(other_user)
      relationships.find_by_followed_id(other_user.id)
    end


    def follow!(other_user)
      relationships.create!(followed_id: other_user.id)
    end
    .
    .
    .
end
```

注意，在代码 11.12 中我们忽略了用户对象自身，直接写成

```ruby
relationships.create!(…)
```

而不是等效的

```
self.relationships.create!(…)
```

是否使用 `self` 关键字只是个人偏好而已。

当然，用户应该既能关注也能取消关注，那么还应该有一个 `unfollow!` 方法，如代码 11.13 所示。<sup>[8](#fn-8)</sup>

**代码 11.13** 测试取消关注用户<br />`spec/models/user_spec.rb`

```ruby
require 'spec helper'

  describe User do

    .
    .
    .
    it { should respond_to(:follow!) }
    it { should respond_to(:unfollow!) }
    .
    .
    .
    describe "following" do
      .
      .
      .
      describe "and unfollowing" do
        before { @user.unfollow!(other_user)        it { should_not be following(other_user)        its(:followed_users) { should_not include(other_user)
      end
    end
  end
```

`unfollow!` 方法的定义很容易理解，通过 `followed_id` 找到对应的“关系”删除就行了，如代码 11.14 所示。

**代码 11.14** 删除“关系”取消关注用户<br />`app/models/user.rb`

```ruby
class User < ActiveRecord::Base
  .
  .
  .
  def following?(other_user)
    relationships.find_by_followed_id(other_user.id)
  end

  def follow!(other_ser)
    relationships.create!(followed_id: other_user.id)
  end

  def unfollow!(other_user)
    relationships.find_by_followed_id(other_user.id).destroy
  end
  .
  .
  .
end
```

<h3 id="sec-11-1-5">11.1.5 粉丝</h3>

关注关系的最后一部分是定义和 `user.followed_users` 相对应的 `user.followers` 方法。从图 11.7 你或许发现了，获取粉丝数组所需的数据都已经存入 `relationships` 表中了。这里我们用到的方法和实现被关注者时一样，只要对调 `follower_id` 和 `followed_id` 的位置即可。这说明， 只要我们对调这两列的位置，组建成 `reverse_relationships` 表（如图 11.9 所示），`user.followers` 方法的定义就很容易了。

![user has many followers 2nd ed](assets/images/figures/user_has_many_followers_2nd_ed.png)

图 11.9：使用倒转后的 Relationship 模型获取粉丝

我们先来编写测试，相信神奇的 Rails 将再一次显现威力，如代码 11.15 所示。

**代码 11.15** 测试对调后的关注关系<br />`spec/models/user_spec.rb`

```ruby
require 'spec helper'
describe User do

  .
  .
  .
  it { should respond_to(:relationships) }
  it { should respond_to(:followed users) }
  it { should respond_to(:reverse relationships) }
  it { should respond_to(:followers) }
  .
  .
  .

  describe "following" do .
    .
    .
    it { should be following(other user) }
    its(:followed users) { should include(other user) }

    describe "followed user" do
      subject { other user }
    its(:followers) { should include(@user) }
    end
    .
    .
    .
  end
end
```

注意一下上述代码中，我们是如何使用 `subject` 来转变测试对象的，我们从 `@user` 转到了 `other_user`，然后，我们就能使用下面下面这种很自然的方式测试粉丝中是否包含 `@user` 了：

```ruby
subject { other_user }
its(:followers) { should include(@user) }
```

你可能已经想到了，我们不会再建立一个完整的数据表来存放倒转后的关注关系。事实上，我们会通过被关注者和粉丝之间的对称关系来模拟一个 `reverse_relationships` 表，主键设为 `followed_id`。也就是说，`relationships` 表使用 `follower_id` 做外键：

```ruby
has_many :relationships, foreign_key: "follower_id"
```

那么，`reverse_relationships` 虚拟表就用 `followed_id` 做外键：

```ruby
has_many :reverse_relationships, foreign_key: "followed_id"
```

粉丝的关联就建立在这层反转的关系上，如代码 11.16 所示。

**代码 11.16** 通过反转的关系实现 `user.followers`<br />`app/models/user.rb``

```ruby
class User < ActiveRecord::Base
  .
  .
  .
  has many :reverse relationships, foreign key: "followed id",
    classname: "Relationship",
    dependent: :destroy
  has many :followers, through: :reverse relationships, source: :follower
  .
  .
  .
end
```


（和代码 11.4 一样，针对 `dependent :destroy` 的测试会留作练习，参见 [11.5 节](#sec-11-1-5)。） 注意为了实现数据表之间的关联，我们要指定类名：

```ruby
has_many :reverse_relationships, foreign_key: "followed_id",
                                 class_name: "Relationship"
```

如果没有指定类名，Rails 会尝试寻找 `ReverseRelationship` 类，而这个类并不存在。

还有一点值得注意一下，在里我们其实可以省略 `:source` 参数，使用下面的简单方式

```ruby
has_many :followers, through: :reverse_relationships
```

对 `:followers` 属性而言，Rails 会把“followers”转成单数形式，自动寻找名为 `follower_id` 的外键。在此我保留了 `:source` 参数是为了保持调与 ` has_many :followed_users` 关系之间的对应结构，你也可以选择去掉它。

加入代码 11.16 之后，关注者和粉丝之间的关联就完成了，所有的测试应该都可以通过了：

```sh
$ bundle exec rspec spec/
```

<h2 id="sec-11-2">11.2 关注用户功能的网页界面</h2>

在本章的导言中，我们介绍了关注用户功能的操作流程。本节我们会实现这些构思的基本界面，以及关注和取消关注操作。同时，我们还会创建两个页面，分别列出关注的用户和粉丝。在 [11.3 节](#sec-11-3)中我们会加入用户的动态列表，其时，这个示例程序才算完成。

<h3 id="sec-11-2-1">11.2.1 用户关注用到的示例数据</h3>

和之前的几章一样，我们会使用 Rake 任务生成示例数据，向数据库中存入临时的用户关注关联数据。有了这些示例数据，我们就可以先开发网页，而把后端功能的实现放在本节的最后。

我们在代码 10.23 中用到的示例数据生成器有点乱，所以现在我们要分别定义两个方法，用来生成用户和微博示例数据，然后再定义 `make_relationships` 方法，生成用户关注关联数据，如代码 11.17 所示。

**代码 11.17** 加入用户关注关联示例数据<br />`lib/tasks/sample_data.rake`

```ruby
namespace :db do
  desc "Fill database with sample data"
  task populate: :environment do
    make_users
    make_microposts
    make_relationships
  end
end

def make_users
  admin = User.create!(name:     "Example User",
                       email:    "example@railstutorial.org",
                       password: "foobar",
                       password_confirmation: "foobar")
  admin.toggle!(:admin)
  99.times do |n|
    name  = Faker::Name.name
    email = "example-#{n+1}@railstutorial.org"
    password  = "password"
    User.create!(name:     name,
                 email:    email,
                 password: password,
                 password_confirmation: password)
  end
end

def make_microposts
  users = User.all(limit: 6)
  50.times do
    content = Faker::Lorem.sentence(5)
    users.each { |user| user.microposts.create!(content: content) }
  end
end

def make_relationships
  users = User.all
  user  = users.first
  followed_users = users[2..50]
  followers      = users[3..40]
  followed_users.each { |followed| user.follow!(followed) }
  followers.each      { |follower| follower.follow!(user) }
end
```

用户关注关联的示例数据是由下面的代码生成的：

```ruby
def make_relationships
  users = User.all
  user  = users.first
  followed_users = users[2..50]
  followers      = users[3..40]
  followed_users.each { |followed| user.follow!(followed) }
  followers.each      { |follower| follower.follow!(user) }
end
```

我们的安排是随机的，让第 1 个用户关注第 3 到第 51 个用户，再让第 4 到第 41 个用户关注第 1 个用户。形成了这样的用户关注网，就足够用来开发程序的界面了。

和之前一样，要想运行代码 11.17，旧的执行下面的数据库命令：

```sh
$ bundle exec rake db:reset
$ bundle exec rake db:populate
$ bundle exec rake db:test:prepare
```

1. 构思图中的头像来自 <http://www.flickr.com/photos/john_lustig/2518452221> 和 <http://www.flickr.com/photos/30775272@N05/2884963755>
2. 在本书第一版中，使用了 `user.following`， 但我发现有时读起来感觉怪怪的。感谢读者 Cosmo Lee 说服我修改这个表述，并建议我如何使其理解起来更容易些。(不过我并没有完全采纳他的建议，所以如果你阅读时仍感到迷惑请不要怪他。)
3. 为了简单清晰，图 11.6 中没有显示 `followed_users` 表的 id 列
4. 请在 Stack Overflow 网站上阅读[关于“何时应使用 let 方法”的讨论](http://stackoverflow.com/questions/5359558/when-to-use-rspec-let)来了解更多内容
5. 严格来说，Rails 是使用 `underscore` 方法把类名转换为 id 的。例如，`"Foobar".underscore` 的结果是 `"foo_bar"`，所以 Foobar 对象的外键是 `foo_bar_id`。（顺便说一下，`underscore` 的逆操作是 `camelize`，这个方法会把 `"camel_case"` 转换成 `"CamelCase"`。）
6. 如果你注意到 `followed_id` 同样可以标识用户，并且担心这个解决方法会造成被关注者和粉丝之间存在非对称的关系, 你已经想到我们的前面了，我们会在 [11.1.5 节](#sec-11-1-5)解决这个问题。
7. 当你拥有在某个领域大量建立模型的经验后，你总能提前猜到这样的工具方法，如果你没有猜到的话，你也经常能发现自己动手写这样的方法可以使测试代码更加整洁。此时，如果你没有猜到它们的话也很正常。软件开发经常是一个循序渐进的过程，你先埋头编写代码，发现代码很乱时，再重构。 但为了行文简洁，本书采取的是直捣黄龙的方法。
8. 事实上 `unfollow!`方法在失败时不会抛出异常，我甚至不知道 Rails 是如何表明删除操作失败的。不过为了和 `follow!` 保持一致，我们还是加上了感叹号。
