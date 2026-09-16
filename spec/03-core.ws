; -*- mode: clojure -*-

;; Arrays

(is (= (array 1 2 3) '(1 2 3)))
(is (array? '(1 2 3)))
(is-not (array? nil))

(def an-array (array 1 2 3))
(def an-array-copy (add an-array E))
(add! an-array PI)
(is (= (at an-array 3) PI))
(is (= (at an-array-copy 3) E))

(remove! an-array 1)
(is (= (at an-array 1) 3))

(clear! an-array-copy)
(is (empty? an-array-copy))

;; Hash Map

(def a-map (hash-map :a 1 :b 2))
(is (= a-map {:a 1 :b 2}))
(is (key? a-map :a))
(is (key? a-map :b))
(is-not (key? a-map :c))
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
(is-not (member? a-set 4))
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

;; If-Not

(is (= 3 (if-not 1 2 3)))
(is (= 2 (if-not false 2 3)))
(is (= 2 (if-not nil 2 3)))

;; When / Unless

(is (= 3 (when true 1 2 3)))
(is (= 3 (unless false 1 2 3)))

;; set!

(def v 1)
(set! v 2)
(is (= v 2))

(def a (array))
(set! a 1 2)
(is (= (a 1) 2))

(def m {})
(set! m :a 1)
(is (= (m :a) 1))

(def o (js-object))
(set! o "name" "Jane")
(is (= (send o :js.prop/name) "Jane"))

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
(is (frozen? (freeze! (js-object))))
(is (sealed? (seal! (js-object))))
(is (not (extensible? (prevent-extensions! (js-object)))))
(is (= ((bind (send js/Array [:js/dig :prototype :toString]) (array 1 2 3))) "1,2,3"))

;; OOP

(def AClass (make-class))
(is (class? AClass))

(add-method AClass "hi" (fn* () "Hi!"))

(def a-instance (new AClass))
(is (instance? a-instance AClass))
(is (identical? "Hi!" (send a-instance :hi)))
