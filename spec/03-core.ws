; -*- mode: clojure -*-

;; Arrays

(is (= (array 1 2 3) '(1 2 3)))
(is (array? '(1 2 3)))
(is (not (array? nil)))

;; Hash Map

(def a-map (hash-map :a 1 :b 2))
(is (= a-map {:a 1 :b 2}))
(is (key? a-map :a))
(is (key? a-map :b))
(is (not (key? a-map :c)))
(is (= (size a-map) 2))
(is (= (keys a-map) (array :a :b)))
(is (= (values a-map) (array 1 2)))
(is (= (entries a-map) (array (array :a 1) (array :b 2))))
(add-key! a-map :c PI)
(is (= (a-map :c) PI))

;; Set

(def a-set (set [1 2 3 3]))
(is (= a-set #{1 2 3}))
(is (member? a-set 1))
(is (not (member? a-set 4)))
(add-member! a-set 4)
(is (member? a-set 4))

;; Named

(is (nil? (namespace 'hey)))
(is (identical? "hey" (name 'hey)))
(is (identical? "hey" (namespace 'hey/you)))
(is (identical? "you" (name 'hey/you)))

;; Comment

(is (nil? (comment 1 2 3)))
(is (nil? (comment (say "Hi"))))

;; Cond

(is (nil? (cond false 1)))
(is (identical? 2 (cond nil 1 :else 2)))
(is (identical? 2 (cond false 1 :else 2)))
(is (identical? 1 (cond true 1 :else 2)))
(is (identical? 1 (cond true 1)))

;; Fn

(def greet
  (fn
    (() "Hello, World!")
    ((name) (str "Hello, " name "!"))))

(is (identical? "Hello, World!" (greet)))
(is (identical? "Hello, Jane!" (greet "Jane")))
(is (= (arity greet) 0)) ; for now all fns have 0 arity
(is (= ((partial (fn (a b c) [a b c]) 1) 2 3) [1 2 3]))

;; JavaScript

(is (identical? "[object Date]" (js-object-tag (new js/Date))))
(is (sealed? (seal! (js-object))))
(is (not (extensible? (prevent-extensions! (js-object)))))
(is (= ((bind (slot-get js/Array :prototype :toString) (array 1 2 3))) "1,2,3"))

;; OOP

(def AClass (make-class))
(is (class? AClass))

(add-method AClass "hi" (fn* () "Hi!"))

(def a-instance (new AClass))
(is (instance? a-instance AClass))
(is (identical? "Hi!" (send a-instance :hi)))
