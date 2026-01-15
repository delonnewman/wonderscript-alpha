; -*- mode: clojure -*-

;; Nil
(is (nil? nil))
(is (identical? nil nil))
(is (= nil nil))
(is (nil? (js* "null")))
(is (nil? (js* "undefined")))

;; True
(is (boolean? true))
(is (identical? true true))
(is (= true true))

;; False
(is (boolean? false))
(is (identical? false false))
(is (= false false))

;; Symbols
(is (symbol? 'x))
(is (not-identical? 'a 'b))
(is (= 'a 'a))

;; Keywords
(is (keyword? :x))
;; (is (identical? :a :b))
(is (= :a :a))

;; Numbers
(is (number? 10))
(is (identical? 1 1))
(is (identical? 1000 1_000))
(is (identical? 1000000 1_000_000))
(is (= 1000 1_000))
;; (is (identical? 1000 1e3))

;; Strings
(is (string? "Hi there!"))
(is (identical? "Hey!" "Hey!"))
(is (= "Hey!" "Hey!"))

;; Lists
(is (list? (list 1 2 3)))
(is (not-identical? (list 1 2 3) (list 1 2 3)))
;; (is (= (list 1 2 3) (list 1 2 3)))

;; Arrays
(is (array? '(1 2 3)))
(is (not-identical? '(1 2 3) '(1 2 3)))
(is (not-identical? '(1 2 3) (array 1 2 3)))
(is (= '(1 2 3) '(1 2 3)))
(is (= '(1 2 3) (array 1 2 3)))

;; Vectors
(is (vector? [1 2 3]))
(is (not-identical? [1 2 3] [1 2 3]))
(is (= [1 2 3] [1 2 3]))
;; (is (identical? ([1 2 3] 0)))

;; Maps
(is (map? {:a 1, :b 2}))
(is (not-identical? {:a 1, :b 2} {:a 1 :b 2}))
(is (= {:a 1, :b 2} {:a 1 :b 2}))
;; (is (identical? 2 ({:a 1 :b 2} :a)))

;; Sets
(is (set? #{1 2 3}))
(is (not-identical? #{1 2 3} #{1 2 3}))
(is (= #{1 2 3} #{1 2 3}))
(is (#{1 2 3} 1))
